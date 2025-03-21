const ApiResponse = require('../utils/api-response');
const InvoiceDb = require('../database/invoiceDb.js');
const doctorDb = require('../database/doctorDb.js');
const insuranceCoDb = require('../database/insuranceCoDb.js');
const invoiceDb = require('../database/invoiceDb.js');

async function addInvoice(invoice, user) {
  try {
    console.log("Service received request ", invoice);

    // Calculate the subtotal
    const Sub_Total = invoice.dynamicRows.reduce((total, row) => {
      const value = parseFloat(row.value) || 0; // Ensure valid number
      return total + value;
    }, 0);

    // Parse discount and PDC amounts
    const discount = parseFloat(invoice.discount) || 0; // Ensure valid discount
    let pdc = parseFloat(invoice.pdc) || 0; // Ensure valid PDC amount

    // Recalculate payable_amt based on bill_method
    if (invoice.bill_method === "Reimbursement") {
      pdc = 0; // Reset PDC if bill_method is Reimbursement
    }

    // Calculate the payable amount
    const payable_amt = Sub_Total - discount - pdc;

    // Create a new invoice document
    const newInvoice = new InvoiceDb({
      invoice_id: invoice.invoice_id,
      admission_no: invoice.admission_no,
      patientName: invoice.patientName,
      discharge_date: invoice.discharge_date,
      dischargetime: invoice.dischargetime,
      bed_category: invoice.bed_category,
      admission_date: invoice.admission_date,
      admissiontime: invoice.admissiontime,
      consultantName: invoice.consultantName,
      surgeonName: invoice.surgeonName,
      creation_date: invoice.admission_date, // Mapping admission_date to creation_date
      pay_mode: invoice.pay_mode,
      phone: invoice.phone,
      insurance: invoice.insurance,
      tpa: invoice.tpa,
      dynamicRows: invoice.dynamicRows.map(row => ({
        label: row.label,
        value: row.value, // Ensure value is non-negative as per validation
      })),
      Sub_Total: invoice.Sub_Total,
      bill_Type: invoice.bill_Type,
      bill_method: invoice.bill_method,
      chequeno: invoice.chequeno, // Ensure chequeno is non-negative as per validation
      pdc: invoice.pdc, // Ensure pdc is non-negative as per validation
      discount: invoice.discount, // Ensure discount is non-negative as per validation
      payable_amt: payable_amt,
      note: invoice.note,
    });

    // Save the invoice to the database
    const result = await newInvoice.save();
    console.log("Invoice successfully registered", result);

    // Return a valid response
    return new ApiResponse(201, "Invoice registered successfully.", null, result);
  } catch (error) {
    console.error("Error while registering invoice: ", error.message);
    return new ApiResponse(500, "Exception while invoice registration.", null, error.message);
  }
}

async function editInvoice(invoice_id, payload, user) {
  try {
    let invoice = await invoiceDb.findOne({
      invoice_id: { $eq: invoice_id }
    });
    if (!invoice)
      return new ApiResponse(
        400,
        "invoice not found for edit",
        null,
        null
      );
    
    payload.invoice_id = invoice_id;
    delete payload._id;

    await invoiceDb.findOneAndUpdate({ _id: invoice._id }, payload);
    return new ApiResponse(
      200,
      "invoice details Updated Successfully.",
      null,
      payload
    );
  } catch (error) {
    console.log("Error while updating invoice details: ", error.message);
    return new ApiResponse(
      500,
      "Exception while updating invoice details.",
      null,
      error.message
    );
  }
}

async function listInvoice(date){
  try {
    const invoices = await invoiceDb
      .find()
      .sort({ _id: -1 }) // Sort by _id in descending order (newest first)
      .limit(500);
    return invoices;
  } catch (error) {
    console.log("Error while fetching invoice: ", error.message);
    throw new Error("Unable to fetch invoice.");
  }
}



// Fetch Consultant Dropdown
async function consultant_dropdown() {
  try {
    const consultants = await doctorDb.find({ doctor_type: { $ne: 'Main' } }, 'name');
    if (!consultants || consultants.length === 0) {
      return new ApiResponse(404, "No consultants data found", null, null);
    }
    console.log("Consultant dropdown data:", consultants);
    return new ApiResponse(200, "Consultant dropdown fetched successfully", null, consultants);
  } catch (error) {
    console.error("Error while fetching consultant_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch consultant_dropdown", error.message, null);
  }
}

// Fetch Surgeon Dropdown
async function surgeon_dropdown() {
  try {
    const surgeons = await doctorDb.find({ doctor_type: 'Main' }, 'name');
    if (!surgeons || surgeons.length === 0) {
      return new ApiResponse(404, "No surgeons data found", null, null);
    }
    console.log("Surgeon dropdown data:", surgeons);
    return new ApiResponse(200, "Surgeon dropdown fetched successfully", null, surgeons);
  } catch (error) {
    console.error("Error while fetching surgeon_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch surgeon_dropdown", error.message, null);
  }
}

// Fetch Insurance Company Dropdown
async function insurance_co_dropdown() {
  try {
    const insc = await insuranceCoDb.find({ company_type: 'Company' }, 'companyname');
    if (!insc || insc.length === 0) {
      return new ApiResponse(404, "No insurance company data found", null, null);
    }
    console.log("Insurance company dropdown data:", insc);
    return new ApiResponse(200, "Insurance company dropdown fetched successfully", null, insc);
  } catch (error) {
    console.error("Error while fetching insurance company:", error.message);
    return new ApiResponse(501, "Unable to fetch insurance company", error.message, null);
  }
}

// Fetch TPA Dropdown
async function tpa_dropdown() {
  try {
    console.log("Service received request to fetch TPA dropdown");
    const tpas = await insuranceCoDb.find({ company_type: 'TPA' }, 'companyname');
    if (!tpas || tpas.length === 0) {
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
