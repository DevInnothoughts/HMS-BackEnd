const ApiResponse = require('../utils/api-response');
// Removed MongoDB/Mongoose database imports

/**
 * Helper function to execute a MySQL query directly on the pool.
 * @param {object} pool - MySQL connection pool instance.
 * @param {string} sql - SQL query string.
 * @param {Array<any>} params - Query parameters.
 * @returns {Promise<Array<object>>} - Query results (rows).
 */
async function executePoolQuery(pool, sql, params = []) {
    const [rows] = await pool.query(sql, params);
    return rows;
}

/**
 * 1. Add a new invoice (Converted to MySQL)
 */
async function addInvoice(pool, invoice, user) {
  try {
    console.log("Service received request ", invoice);

    // Calculate the subtotal from dynamicRows
    const Sub_Total = (invoice.dynamicRows || []).reduce((total, row) => {
      const value = parseFloat(row.value) || 0;
      return total + value;
    }, 0);

    // Parse discount and PDC amounts
    const discount = parseFloat(invoice.discount) || 0;
    let pdc = parseFloat(invoice.pdc) || 0;

    // Recalculate payable_amt based on bill_method
    if (invoice.bill_method === "Reimbursement") {
      pdc = 0; // Reset PDC if bill_method is Reimbursement
    }

    // Calculate the final payable amount
    const payable_amt = Sub_Total - discount - pdc;

    // Convert dynamicRows array to JSON string for single column storage
    const dynamicRowsJson = JSON.stringify(invoice.dynamicRows.map(row => ({
        label: row.label,
        value: parseFloat(row.value) || 0,
    })));
    
    // Check if invoice_id already exists (Optional, but good for ID integrity)
    const checkSql = `SELECT invoice_id FROM invoice WHERE invoice_id = ? LIMIT 1`;
    const existingInvoice = await executePoolQuery(pool, checkSql, [invoice.invoice_id]);
    
    if (existingInvoice.length > 0) {
        return new ApiResponse(400, "Invoice ID already exists.", null, null);
    }
    
    // Insert new invoice record
    const insertSql = `
      INSERT INTO invoice (
        invoice_id, admission_no, patientName, discharge_date, dischargetime, bed_category, 
        admission_date, admissiontime, consultantName, surgeonName, creation_date, pay_mode, 
        phone, insurance, tpa, dynamicRows, Sub_Total, bill_Type, bill_method, chequeno, 
        pdc, discount, payable_amt, note
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    const params = [
      invoice.invoice_id, invoice.admission_no, invoice.patientName, invoice.discharge_date, 
      invoice.dischargetime, invoice.bed_category, invoice.admission_date, invoice.admissiontime, 
      invoice.consultantName, invoice.surgeonName, invoice.admission_date, invoice.pay_mode, 
      invoice.phone, invoice.insurance, invoice.tpa, dynamicRowsJson, 
      Sub_Total, // Use calculated Sub_Total
      invoice.bill_Type, invoice.bill_method, invoice.chequeno, 
      pdc, // Use calculated pdc
      discount, // Use calculated discount
      payable_amt, // Use calculated payable_amt
      invoice.note,
    ];

    const [result] = await pool.query(insertSql, params);
    
    if (result.affectedRows === 0) {
        throw new Error("Failed to insert invoice record.");
    }

    console.log("Invoice successfully registered. Insert ID:", result.insertId);

    // Return the inserted ID and calculated amount
    return new ApiResponse(201, "Invoice registered successfully.", null, {
        insertId: result.insertId,
        invoice_id: invoice.invoice_id,
        payable_amt: payable_amt,
    });
  } catch (error) {
    console.error("Error while registering invoice: ", error.message);
    return new ApiResponse(500, "Exception while invoice registration.", null, error.message);
  }
}

/**
 * 2. Edit Invoice (Converted to MySQL)
 */
async function editInvoice(pool, invoice_id, payload, user) {
  try {
    // 1. Find the invoice by ID
    const findSql = `SELECT * FROM invoice WHERE invoice_id = ? AND (is_deleted IS NULL OR is_deleted != 1) LIMIT 1`;
    const [invoice] = await executePoolQuery(pool, findSql, [invoice_id]);
    
    if (!invoice) {
        return new ApiResponse(400, "Invoice not found for edit", null, null);
    }
    
    // 2. Calculate dynamic fields if needed in payload
    // NOTE: If dynamicRows is present in payload, we must recalculate amounts
    if (payload.dynamicRows) {
        const Sub_Total = (payload.dynamicRows || []).reduce((total, row) => {
            const value = parseFloat(row.value) || 0;
            return total + value;
        }, 0);

        const discount = parseFloat(payload.discount || invoice.discount) || 0;
        let pdc = parseFloat(payload.pdc || invoice.pdc) || 0;
        
        if (payload.bill_method === "Reimbursement") {
            pdc = 0;
        }

        payload.Sub_Total = Sub_Total;
        payload.pdc = pdc;
        payload.discount = discount;
        payload.payable_amt = Sub_Total - discount - pdc;
        payload.dynamicRows = JSON.stringify(payload.dynamicRows.map(row => ({
            label: row.label,
            value: parseFloat(row.value) || 0,
        })));
    }
    
    // 3. Prepare dynamic update query
    const updateFields = Object.keys(payload).filter(key => key !== 'invoice_id');
    
    if (updateFields.length === 0) {
        return new ApiResponse(200, "No changes provided.", null, payload);
    }

    const setClauses = updateFields.map(field => `${field} = ?`).join(', ');
    const updateValues = updateFields.map(field => payload[field]);
    updateValues.push(invoice_id); // For WHERE clause

    const updateSql = `
        UPDATE invoice 
        SET ${setClauses} 
        WHERE invoice_id = ?
        LIMIT 1;
    `;

    const [updateResult] = await pool.query(updateSql, updateValues);
    
    if (updateResult.affectedRows === 0) {
        console.warn(`Invoice ${invoice_id} found but not updated.`);
    }

    // Return the updated payload
    return new ApiResponse(200, "Invoice details Updated Successfully.", null, payload);
  } catch (error) {
    console.error("Error while updating invoice details: ", error.message);
    return new ApiResponse(500, "Exception while updating invoice details.", null, error.message);
  }
}

/**
 * 3. List Invoice (Converted to MySQL)
 */
async function listInvoice(pool, date) {
  try {
    // Note: Filtering by 'date' in the original MongoDB query was unclear. 
    // Assuming we fetch the most recent 500 active invoices.
    const sql = `
        SELECT *
        FROM invoice
        WHERE (is_deleted IS NULL OR is_deleted != 1)
        ORDER BY invoice_id DESC 
        LIMIT 500;
    `;
    const invoices = await executePoolQuery(pool, sql);
    
    // Parse dynamicRows JSON back to object array for consistency with original response structure
    const parsedInvoices = invoices.map(invoice => ({
        ...invoice,
        dynamicRows: invoice.dynamicRows ? JSON.parse(invoice.dynamicRows) : [],
    }));
    
    return parsedInvoices;
  } catch (error) {
    console.error("Error while fetching invoice: ", error.message);
    throw new Error("Unable to fetch invoice.");
  }
}


/**
 * 4. Fetch Consultant Dropdown (Converted to MySQL)
 */
async function consultant_dropdown(pool) {
  try {
    const sql = `
      SELECT name
      FROM doctor
      WHERE doctor_type != 'Main' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const consultants = await executePoolQuery(pool, sql);
    
    if (consultants.length === 0) {
      return new ApiResponse(404, "No consultants data found", null, null);
    }
    return new ApiResponse(200, "Consultant dropdown fetched successfully", null, consultants);
  } catch (error) {
    console.error("Error while fetching consultant_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch consultant_dropdown", error.message, null);
  }
}

/**
 * 5. Fetch Surgeon Dropdown (Converted to MySQL)
 */
async function surgeon_dropdown(pool) {
  try {
    const sql = `
      SELECT name
      FROM doctor
      WHERE doctor_type = 'Main' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const surgeons = await executePoolQuery(pool, sql);
    
    if (surgeons.length === 0) {
      return new ApiResponse(404, "No surgeons data found", null, null);
    }
    return new ApiResponse(200, "Surgeon dropdown fetched successfully", null, surgeons);
  } catch (error) {
    console.error("Error while fetching surgeon_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch surgeon_dropdown", error.message, null);
  }
}

/**
 * 6. Fetch Insurance Company Dropdown (Converted to MySQL)
 */
async function insurance_co_dropdown(pool) {
  try {
    const sql = `
      SELECT companyname
      FROM insurance_company
      WHERE company_type = 'Company' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY companyname ASC;
    `;
    const insc = await executePoolQuery(pool, sql);
    
    if (insc.length === 0) {
      return new ApiResponse(404, "No insurance company data found", null, null);
    }
    return new ApiResponse(200, "Insurance company dropdown fetched successfully", null, insc);
  } catch (error) {
    console.error("Error while fetching insurance company:", error.message);
    return new ApiResponse(501, "Unable to fetch insurance company", error.message, null);
  }
}

/**
 * 7. Fetch TPA Dropdown (Converted to MySQL)
 */
async function tpa_dropdown(pool) {
  try {
    const sql = `
      SELECT companyname
      FROM insurance_company
      WHERE company_type = 'TPA' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY companyname ASC;
    `;
    const tpas = await executePoolQuery(pool, sql);
    
    if (tpas.length === 0) {
      return new ApiResponse(404, "No TPA data found", null, null);
    }
    return new ApiResponse(200, "TPA data fetched successfully", null, tpas);
  } catch (error) {
    console.error("Error while fetching TPA data:", error.message);
    return new ApiResponse(500, "Error while fetching TPA data", error.message, null);
  }
}

module.exports = { 
  addInvoice,
  editInvoice,
  listInvoice,
  consultant_dropdown, 
  surgeon_dropdown,
  insurance_co_dropdown,
  tpa_dropdown,
};