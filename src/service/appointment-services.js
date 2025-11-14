const ApiResponse = require("../utils/api-response");
const moment = require("moment");
// Assuming this now returns the MySQL Pool instance directly
const { getConnectionByLocation } = require("../config/dbConnection.js");
require("dotenv").config();

// Helper function to format phone numbers
function formatPhoneNumber(phoneNumber) {
  if (phoneNumber && typeof phoneNumber === "string") {
    return phoneNumber.replace(/\D/g, "");
  }
  return "";
}

// Helper to get the MySQL pool
function getPool(location, user) {
  const loc = location || (user && user.location) || 'default';
  return getConnectionByLocation(loc).connection;
}
/**
 * 1. Add a new appointment
 */
async function addAppointment(appointment, user) {
  console.log("Service received request ", appointment);
  const pool = getPool(appointment.patient_location, user);

  if (!pool) {
    return new ApiResponse(404, "Invalid location/DB connection.", null, null);
  }

  try {
    // 1. Get Appointment Count for new ID
    const [countResult] = await pool.query(`SELECT COUNT(*) AS count FROM appointment`);
    const appointmentCount = countResult[0].count;
    const newAppointmentId = `2025${appointmentCount + 1}`;
    
    // 2. Insert the new appointment record
    const sql = `
      INSERT INTO appointment (
        appointment_id, appointment_timestamp, doctorName, patientName, patient_phone,
        patient_location, appointmentTime, FDE_Name, note, reference, departmentName,
        appointmentWith, patient_type, ConfirmPatient, consultation_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      newAppointmentId,
      appointment.date, 
      appointment.doctorName,
      appointment.patientName,
      appointment.patient_phone,
      appointment.patient_location,
      appointment.appointmentTime,
      appointment.FDE_Name,
      appointment.note,
      appointment.reference,
      appointment.departmentName,
      appointment.appointmentWith,
      appointment.patient_type,
      0, // ConfirmPatient: 0 (Unconfirmed)
      appointment.consultation_name,
    ];

    const [result] = await pool.query(sql, params);
    
    if (result.affectedRows === 0) {
        throw new Error("Failed to insert appointment record.");
    }

    console.log("Appointment successfully registered with ID:", newAppointmentId);

    return new ApiResponse(
      201,
      "Appointment registered successfully. Requires confirmation.",
      null,
      { insertId: result.insertId, appointment_id: newAppointmentId }
    );
  } catch (error) {
    console.error("Error while registering appointment:", error.message);
    return new ApiResponse(
      500,
      "Exception while appointment registration.",
      null,
      error.message
    );
  }
}

/**
 * 2. Confirm an Appointment
 */
async function confirmAppointment(appointment_id, location) {
  const pool = getPool(location);

  if (!pool) {
    return new ApiResponse(404, "Invalid location/DB connection.", null, null);
  }

  try {
    console.log("Service received request to confirm appointment:", appointment_id);

    // 1. Fetch the appointment by ID
    const [appointmentRows] = await pool.query(
        `SELECT patient_id, ConfirmPatient FROM appointment WHERE appointment_id = ? LIMIT 1`, 
        [appointment_id]
    );

    const appointment = appointmentRows[0];

    if (!appointment) {
      return new ApiResponse(404, "Appointment not found.", null, null);
    }
    if (appointment.ConfirmPatient === 1) {
      return new ApiResponse(400, "Appointment is already confirmed.", null, null);
    }

    // 2. Capture confirm time
    const confirmTime = moment().format("HH:mm:ss");

    // 3. Generate new patient ID (Requires transaction for safety, simplified here)
    const [patientCountResult] = await pool.query(`SELECT COUNT(*) AS count FROM patient`);
    const patientCount = patientCountResult[0].count;
    const newPatientId = `HHC/DP/${patientCount + 1}`; 

    // 4. Update patient record
    const updatePatientSql = `
      UPDATE patient 
      SET Uid_no = ?, ConfirmPatient = 1
      WHERE patient_id = ?
      LIMIT 1;
    `;
    await pool.query(updatePatientSql, [newPatientId, appointment.patient_id]);
    console.log("✅ Patient updated with UID:", newPatientId);

    // 5. Update appointment record
    const updateAppointmentSql = `
      UPDATE appointment
      SET confirm_time = ?, Uid_no = ?, ConfirmPatient = 1
      WHERE appointment_id = ?
      LIMIT 1;
    `;
    const [updateResult] = await pool.query(updateAppointmentSql, [confirmTime, newPatientId, appointment_id]);

    if (updateResult.affectedRows === 0) {
      return new ApiResponse(
        500,
        "Error while updating appointment status.",
        null,
        null
      );
    }

    console.log("✅ Appointment confirmed successfully:", appointment_id);

    return new ApiResponse(200, "Appointment confirmed successfully.", {
      confirm_time: confirmTime,
    });
  } catch (error) {
    console.error("❌ Error while confirming appointment:", error.message);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

/**
 * 3. Edit Appointment
 */
async function editAppointment(patient_phone, updateData, user) {
  const pool = getPool(updateData.patient_location, user);

  if (!pool) {
    return new ApiResponse(404, "Invalid location/DB connection.", null, null);
  }

  const formattedPhone = formatPhoneNumber(patient_phone);
  if (!formattedPhone) {
    return new ApiResponse(400, "Phone number is required", null, null);
  }
  
  const fields = Object.keys(updateData).filter(key => key !== 'patient_phone' && key !== 'location');
  if (fields.length === 0) {
      return new ApiResponse(400, "No fields provided for update", null, null);
  }

  const setClauses = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updateData[field]);
  values.push(formattedPhone);

  const sql = `
    UPDATE appointment
    SET ${setClauses}
    WHERE patient_phone = ?
    LIMIT 1;
  `;

  try {
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return new ApiResponse(404, "Appointment not found or already up to date", null, null);
    }
    
    // Fetch the updated record to return it
    const [updatedRows] = await pool.query(
        `SELECT * FROM appointment WHERE patient_phone = ? LIMIT 1`, 
        [formattedPhone]
    );

    const updatedAppointment = updatedRows[0];

    console.log("✅ Appointment updated successfully:", updatedAppointment);
    return new ApiResponse(
      200,
      "Appointment updated successfully",
      null,
      updatedAppointment,
    );
  } catch (error) {
    console.error(" Service Error while editing appointment:", error.message);
    return new ApiResponse(
      500,
      "Internal server error",
      null,
      error.message
    );
  }
}
/**
 * 4. List Appointments
 */
async function listAppointments({ from, to, location }) {
    const pool = getPool(location);

    if (!pool) {
        return [];
    }

    try {
        if (!from || !to) {
            throw new Error("Missing 'from' or 'to' date in query params.");
        }

        const fromDate = moment(from, "DD-MM-YYYY", true).format("YYYY-MM-DD");
        const toDate = moment(to, "DD-MM-YYYY", true).format("YYYY-MM-DD");
        
        if (!moment(fromDate, "YYYY-MM-DD", true).isValid() || !moment(toDate, "YYYY-MM-DD", true).isValid()) {
            throw new Error(`Invalid date format: from=${from}, to=${to}`);
        }

        const sql = `
         SELECT
          ap.*,
          p.name AS patient_name,
          d.name AS doctor_name
        FROM appointment ap
        LEFT JOIN patient p ON ap.patient_id = p.patient_id
        LEFT JOIN doctor d ON ap.doctor_id = d.doctor_id
        WHERE
          ap.appointment_timestamp BETWEEN ? AND ?
          AND (ap.is_deleted IS NULL OR ap.is_deleted != 1)
        ORDER BY ap.appointment_id DESC;
        `;

        const [rows] = await pool.query(sql, [fromDate, toDate]);

        console.log("✅ Appointments Found:", rows.length);
        return rows;
    } catch (error) {
        console.error("❌ Error fetching appointments:", error.message);
        throw new Error(`Error fetching appointments: ${error.message}`);
    }
}

/**
 * 5. Doctor Dropdown
 */
async function doctorDropdown(location) {
  try {
    const pool = getPool(location);
    if (!pool) throw new Error("Database connection not found for location");

    const [rows] = await pool.query(`SELECT doctor_id, name FROM doctor WHERE (is_deleted IS NULL OR is_deleted != 1) ORDER BY name ASC;`);

    return rows; 
  } catch (err) {
    console.error("❌ Error in service layer while fetching doctor dropdown:", err.message);
    return []; 
  }
}

/**
 * 6. Consultation Dropdown
 */
async function consultationDropdown(location) {
  try {
    const pool = getPool(location);
    if (!pool) throw new Error("Database connection not found for location");

    const [consultations] = await pool.query(`
        SELECT consultation_id, consultation_name
        FROM consultation
        WHERE (is_deleted IS NULL OR is_deleted != 1)
        ORDER BY consultation_name ASC;
    `);

    return consultations;
  } catch (error) {
    console.error("Error fetching consultation dropdown:", error.message);
    throw new Error("Unable to fetch consultation dropdown.");
  }
}

/**
 * 7. FDE Dropdown
 */
async function fdeDropdown(location) {
    try {
        const pool = getPool(location);
        if (!pool) throw new Error("Database connection not found for location");

        const [fdeList] = await pool.query(`
          SELECT FDEID, FDEName
          FROM fdedetails
          WHERE (is_deleted IS NULL OR is_deleted != 1)
          ORDER BY FDEName ASC;
        `);

        console.log(`✅ Retrieved ${fdeList.length} FDEs for dropdown.`);
        return fdeList;
    } catch (error) {
        console.error("❌ Error in service layer while fetching FDE dropdown:", error.message);
        throw new Error("Unable to fetch FDE dropdown.");
    }
}

/**
 * 8. Department Dropdown
 */
async function departmentDropdown(location) {
    try {
        const pool = getPool(location);
        if (!pool) throw new Error("Database connection not found for location");
        
        const [departments] = await pool.query(`
            SELECT department_id, name
            FROM department
            WHERE (is_deleted IS NULL OR is_deleted != 1)
            ORDER BY name ASC;
        `);

        return departments;
    } catch (error) {
        console.error("Error in service layer while fetching department dropdown:", error.message);
        throw new Error("Unable to fetch department dropdown.");
    }
}

/**
 * 9. Treatment Dropdown
 */
async function treatmentDropdown(location) {
    try {
        const pool = getPool(location);
        if (!pool) throw new Error("Database connection not found for location");
        
        const [treatments] = await pool.query(`
            SELECT treatment_id, treatment_name
            FROM treatment
            WHERE (is_deleted IS NULL OR is_deleted != 1)
            ORDER BY treatment_name ASC;
        `);

        return treatments;
    } catch (error) {
        console.error("Error in service layer while fetching treatment dropdown:", error.message);
        throw new Error("Unable to fetch treatment dropdown.");
    }
}

/**
 * 10. Update history check
 */
async function updateHistoryChk(appointment_id, location) {
  try {
    const pool = getPool(location);
    if (!pool) {
        return new ApiResponse(404, "Invalid location/DB connection.", null, null);
    }
    
    // Update historychk field
    const [updateResult] = await pool.query(`
        UPDATE appointment 
        SET historychk = 3 
        WHERE appointment_id = ?
        LIMIT 1;
    `, [appointment_id]);

    if (updateResult.affectedRows === 0) {
        return new ApiResponse(404, "Appointment not found or failed to update.", null, null);
    }

    // Fetch the updated appointment
    const [updatedRows] = await pool.query( 
        `SELECT * FROM appointment WHERE appointment_id = ? LIMIT 1`, 
        [appointment_id]
    );

    console.log("historyChk successfully updated for appointment:", appointment_id);

    return new ApiResponse(200, "History flag updated successfully.", updatedRows[0], null);
  } catch (error) {
    console.error("Error while updating historyChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

/**
 * 11. Update execution check
 */
async function updateExecutionChk(appointment_id, location) {
  try {
    const pool = getPool(location);
    if (!pool) {
        return new ApiResponse(404, "Invalid location/DB connection.", null, null);
    }
    
    // Update the execution flag
    const [updateResult] = await pool.query(`
        UPDATE appointment 
        SET executivechk = 1 
        WHERE appointment_id = ? AND historychk = 3
        LIMIT 1;
    `, [appointment_id]);

    if (updateResult.affectedRows === 0) {
        return new ApiResponse(400, "Appointment not found or preconditions not met (historychk != 3).", null, null);
    }

    console.log("executivechk successfully updated for appointment:", appointment_id);
    return new ApiResponse(200, "Execution flag updated successfully.", null, null);
  } catch (error) {
    console.error("Error while updating executionChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

/**
 * 12. Update consultation check
 */
async function updateConsultationChk(appointment_id, location) {
  try {
    const pool = getPool(location);
    if (!pool) {
        return new ApiResponse(404, "Invalid location/DB connection.", null, null);
    }
    
    // Update consultationchk to 2
    const [updateResult] = await pool.query(`
        UPDATE appointment 
        SET consultationchk = 2 
        WHERE appointment_id = ? AND executivechk = 1
        LIMIT 1;
    `, [appointment_id]);

    if (updateResult.affectedRows === 0) {
        return new ApiResponse(400, "Appointment not found or preconditions not met (executivechk != 1).", null, null);
    }

    console.log("consultationchk successfully updated for appointment:", appointment_id);
    return new ApiResponse(200, "Consultation flag updated successfully.", null, null);
  } catch (error) {
    console.error("Error while updating consultationChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

/**
 * 13. Update execution check to four (receipt completion)
 */
async function updateExecutionChkToFour(appointment_id, location) {
    const pool = getPool(location);
    if (!pool) {
        return new ApiResponse(404, "Invalid location/DB connection.", null, null);
    }

    try {
        // Check current status 
        const [checkRows] = await pool.query( 
            `SELECT executivechk FROM appointment WHERE appointment_id = ? LIMIT 1`, 
            [appointment_id]
        );
        
        const appointment = checkRows[0];
        
        if (!appointment) {
            return new ApiResponse(404, "Appointment not found.", null, null);
        }

        if (appointment.executivechk === 1) {
            const [updateResult] = await pool.query(`
                UPDATE appointment 
                SET executivechk = 4 
                WHERE appointment_id = ?
                LIMIT 1;
            `, [appointment_id]);

            if (updateResult.affectedRows === 0) {
                return new ApiResponse(
                    500,
                    "Error while updating executivechk to 4.",
                    null,
                    null
                );
            }
            return new ApiResponse(200, "Execution flag updated to 4 successfully.", null, null);
        } else {
            return new ApiResponse(400, "Execution flag is not in the expected state (1).", null, null);
        }
    } catch (error) {
        console.error("Error while updating executivechk:", error);
        return new ApiResponse(500, "Internal server error.", null, error.message);
    }
}

async function saveReceipt(receiptData, location) {
    console.log("Initial receipt request received:", receiptData);

    const pool = getPool(location);
    if (!pool) {
        return new ApiResponse(404, "Invalid location/DB connection.", null, null);
    }

    try {
        const requiredFields = ["appointment_id", "totalamt", "paymentmode"];
        const missingFields = requiredFields.filter((field) => !receiptData[field]);

        if (missingFields.length > 0) {
            return new ApiResponse(400, `Missing required fields for receipt: ${missingFields.join(', ')}`, null, null);
        }

        // 1. Get Appointment details (to link patient_id)
        const [appointmentRows] = await pool.query( 
            `SELECT patient_id FROM appointment WHERE appointment_id = ? LIMIT 1`, 
            [receiptData.appointment_id]
        );
        
        const appointment = appointmentRows[0];

        if (!appointment || !appointment.patient_id) {
            return new ApiResponse(404, "Appointment or associated Patient ID not found.", null, null);
        }

        // 2. Get Receipt Count for new ID
        const [countResult] = await pool.query(`SELECT COUNT(*) AS count FROM receipt`);
        const receiptCount = countResult[0].count;
        const newReceiptId = `REC${receiptCount + 1}`;
        
        // Convert date format for MySQL
        const formattedDate = moment(receiptData.receipt_date, "DD-MM-YYYY").format("YYYY-MM-DD");

        // 3. Save main receipt (Assuming 'receipt' table structure)
        const insertReceiptSql = `
            INSERT INTO receipt (
                receipt_id, receipt_date, patient_id, appointment_id, doctor_id, consultation, 
                comment, sprayqty, totalamt, discountnote, discountamt, paymentmode, otherdetails, is_deleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const receiptParams = [
            newReceiptId,
            formattedDate,
            appointment.patient_id,
            receiptData.appointment_id,
            receiptData.doctor_id,
            receiptData.consultation,
            receiptData.comment || '',
            receiptData.sprayqty || 0,
            receiptData.totalamt,
            receiptData.discountnote || '',
            receiptData.discountamt || 0,
            receiptData.paymentmode,
            receiptData.otherdetails || '',
            receiptData.is_deleted || 0,
        ];
        
        const [mainReceiptResult] = await pool.query(insertReceiptSql, receiptParams);

        // 4. Get Item Receipt Count for new ID
        const [itemCountResult] = await pool.query(`SELECT COUNT(*) AS count FROM item_receipt`);
        const itemCount = itemCountResult[0].count;
        const formattedItemId = String(itemCount + 1).padStart(4, "0");
        
        // 5. Save item receipt 
        const insertItemSql = `
            INSERT INTO item_receipt (
                item_id, receipt_id, patient_id, item_date, consultation, total, payment_mode, is_deleted
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const itemParams = [
            formattedItemId,
            newReceiptId,
            appointment.patient_id,
            formattedDate,
            receiptData.consultation, 
            receiptData.totalamt,
            receiptData.paymentmode,
            0,
        ];
        
        const [itemReceiptResult] = await pool.query(insertItemSql, itemParams);
        
        console.log(`Successfully saved receipt ${newReceiptId} and item ${formattedItemId}.`);
        
        return new ApiResponse(
            201,
            "Receipts created successfully.",
            null,
            { receipt_id: newReceiptId, mainReceiptResult, itemReceiptResult }
        );
    } catch (error) {
        console.error("Error while creating receipts:", error);
        return new ApiResponse(
            500,
            "Exception while creating receipts.",
            null,
            error.message
        );
    }
}

/**
 * 15. Get Patient by Mobile
 */
async function getPatientByMobile(patient_phone, location) {
    const pool = getPool(location);
    if (!pool) {
        return new ApiResponse(404, "Invalid location/DB connection.", null, null);
    }

    try {
        console.log("Fetching patient details for mobile number:", patient_phone);
        const formattedPhone = formatPhoneNumber(patient_phone);

        const sql = `SELECT * FROM patient WHERE phone = ? LIMIT 1`;
        const [patients] = await pool.query(sql, [formattedPhone]);

        if (patients.length === 0) {
            return new ApiResponse(
                404,
                "Patient not found in patient list",
                null,
                null
            );
        }

        return new ApiResponse(
            200,
            "Patient details fetched successfully",
            null,
            patients[0] // Return the single patient object
        );
    } catch (error) {
        console.error("Error fetching patient details:", error);
        return new ApiResponse(500, "Internal server error", null, error.message);
    }
}

/**
 * 16. List Receipts
 */
async function listReceipt(queryParams, location) {
    const pool = getPool(location);
    if (!pool) {
        return new ApiResponse(404, "Invalid location/DB connection.", null, null);
    }

    try {
        let whereClauses = ["(r.is_deleted IS NULL OR r.is_deleted != 1)"];
        let params = [];
        
        if (queryParams.from && queryParams.to) {
            const fromDate = moment(queryParams.from, "DD-MM-YYYY").format("YYYY-MM-DD 00:00:00");
            const toDate = moment(queryParams.to, "DD-MM-YYYY").format("YYYY-MM-DD 23:59:59");
            whereClauses.push("r.receipt_date BETWEEN ? AND ?");
            params.push(fromDate, toDate);
        }

        if (queryParams.appointment_id) {
            whereClauses.push("r.appointment_id = ?");
            params.push(queryParams.appointment_id);
        }
        if (queryParams.patient_id) {
            whereClauses.push("r.patient_id = ?");
            params.push(queryParams.patient_id);
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const page = queryParams.page ? parseInt(queryParams.page) : 1;
        const limit = queryParams.limit ? parseInt(queryParams.limit) : 1000;
        const offset = (page - 1) * limit;
        
        const sql = `
            SELECT 
                r.*, 
                a.patientName, 
                a.doctorName,
                a.consultation_name AS appointment_consultation
            FROM receipt r
            LEFT JOIN appointment a ON r.appointment_id = a.appointment_id
            ${whereString}
            ORDER BY r.receipt_id DESC
            LIMIT ? OFFSET ?;
        `;
        
        params.push(limit, offset);

        const [receipts] = await pool.query(sql, params);

        return new ApiResponse(
            200,
            "Receipts fetched successfully.",
            null,
            receipts
        );
    } catch (error) {
        console.error("Error while fetching receipts:", error.message);
        return new ApiResponse(
            500,
            "Unable to fetch receipts.",
            null,
            error.message
        );
    }
}
/**
 * 17. Delete Appointment (Mark as deleted)
 */
async function deleteAppointment(appointment_id, location) {
    const pool = getPool(location);
    if (!pool) {
        return new ApiResponse(404, "Invalid location/DB connection.", null, null);
    }

    try {
        console.log("Service received request to mark appointment as deleted:", appointment_id);

        const [updateResult] = await pool.query(`
            UPDATE appointment 
            SET is_deleted = 1 
            WHERE appointment_id = ?
            LIMIT 1;
        `, [appointment_id]);

        if (updateResult.affectedRows === 0) {
            return new ApiResponse(404, "Appointment not found or failed to delete.", null, null);
        }

        console.log("Appointment marked as deleted successfully:", appointment_id);
        return new ApiResponse(200, "Appointment marked as deleted successfully.", null, null);
    } catch (error) {
        console.error("Error while marking appointment as deleted:", error);
        return new ApiResponse(500, "Internal server error.", null, error.message);
    }
}

module.exports = {
  addAppointment,
  editAppointment,
  listAppointments,
  confirmAppointment,
  doctorDropdown,
  consultationDropdown,
  fdeDropdown,
  departmentDropdown,
  updateHistoryChk,
  updateExecutionChk,
  updateConsultationChk,
  updateExecutionChkToFour,
  treatmentDropdown,
  saveReceipt,
  getPatientByMobile,
  listReceipt,
  deleteAppointment,
};