const ApiResponse = require("../utils/api-response");
// Assuming this utility returns the MySQL Pool instance directly
const { getConnectionByLocation } = require("../../databaseUtils"); 

/**
 * Helper function to execute a MySQL query directly on the pool.
 * @param {object} pool - MySQL connection pool instance.
 * @param {string} sql - SQL query string.
 * @param {Array<any>} params - Query parameters.
 * @returns {Promise<Array<object>>} - Query results (rows).
 */
async function executePoolQuery(pool, sql, params = []) {
    // pool.query returns a promise resolving to [rows, fields]
    const [rows] = await pool.query(sql, params);
    return rows;
}

// Helper function to generate a unique UID (kept from original)
function generateUniqueUid() {
  const prefix = "HHCDP";
  const uniqueNumber = Date.now() + Math.floor(Math.random() * 1000);
  return `${prefix}${uniqueNumber}`;
}

// --- Assuming helper to get pool from location ---
function getPatientPool(location) {
    return getConnectionByLocation(location || "default");
}

/**
 * 1. Add a new patient (Converted to MySQL)
 */
async function addPatient(pool, patient) {
  console.log("Service received request ", patient);
  
  try {
    const Uid_no = patient.Uid_no || generateUniqueUid();
    
    // Check if patient with the same phone already exists (optional check)
    const checkSql = `SELECT patient_id FROM patient WHERE phone = ? AND (is_deleted IS NULL OR is_deleted != 1) LIMIT 1`;
    const existingPatient = await executePoolQuery(pool, checkSql, [patient.mobileNo]);
    
    // NOTE: Decided not to block patient creation on phone existence to match the simplicity of the original Mongo save().

    const insertSql = `
      INSERT INTO patient (
        patient_id, Uid_no, name, prefix, sex, phone, email, pincode, companyname, age, ref, 
        reference_type, occupation, address, registeration_id, mobile_2, timestamp_date, 
        blood_group, birth_date, password, account_opening_timestamp, image, is_deleted, 
        patientHistory, state, country, height, weight, maritalStatus, title, city, date, 
        patient_location, ConfirmPatient, specific_work, identity, patient_type
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    const params = [
      patient.patient_id, Uid_no, patient.patientName, patient.prefix, patient.sex, patient.mobileNo, patient.email, 
      patient.pincode, patient.companyname, patient.age, patient.ref, patient.reference_type, patient.occupation, 
      patient.address, patient.registeration_id, patient.mobile_2, patient.timestamp_date, patient.blood_group, 
      patient.birth_date, patient.password, patient.account_opening_timestamp, patient.image, patient.is_deleted || 0, 
      patient.patientHistory, patient.state, patient.country, patient.height, patient.weight, patient.maritalStatus, 
      patient.title, patient.city, patient.date, patient.patient_location, patient.ConfirmPatient || 0, 
      patient.specific_work, patient.identity, patient.patient_type
    ];

    const [result] = await pool.query(insertSql, params);
    
    if (result.affectedRows === 0) {
        throw new Error("Failed to insert patient record.");
    }

    console.log("Patient successfully registered. Insert ID:", result.insertId);
    
    // Return a dummy object mimicking the saved record structure
    return new ApiResponse(
      201,
      "Patient registered successfully.",
      null,
      { insertId: result.insertId, patient_id: patient.patient_id, Uid_no: Uid_no }
    );

  } catch (error) {
    console.error("Error while registering patient: ", error.message);
    return new ApiResponse(
      500,
      "Exception while patient registration.",
      null,
      error.message
    );
  }
}

/**
 * 2. Edit patient details (Refactored to cleaner MySQL)
 */
async function editPatient(pool, patient_id, payload, user, location) {
  try {
    console.log("Edit request for patient_id:", patient_id);

    if (!patient_id) {
      return new ApiResponse(400, "Missing patient ID.", null, null);
    }
    if (!payload || Object.keys(payload).length === 0) {
      return new ApiResponse(400, "No data provided for update.", null, null);
    }
    
    // 1. Get existing patient record
    const findSql = "SELECT Uid_no FROM patient WHERE patient_id = ?";
    const [patient] = await executePoolQuery(pool, findSql, [patient_id]);

    if (!patient) {
      return new ApiResponse(400, "Patient not found for edit.", null, null);
    }
    
    // 2. Prepare payload and dynamic SQL
    const updatedPayload = {
      ...payload,
      Uid_no: payload.Uid_no || patient.Uid_no, // Ensure Uid_no fallback
    };
    
    // Remove fields that should not be set directly (e.g., primary keys or invalid columns)
    const mutablePayload = Object.keys(updatedPayload).reduce((acc, key) => {
        if (key !== 'patient_id' && updatedPayload[key] !== undefined) {
            acc[key] = updatedPayload[key];
        }
        return acc;
    }, {});


    const fields = Object.keys(mutablePayload).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(mutablePayload);

    if (fields.length === 0) {
        return new ApiResponse(200, "No changes provided.", null, {});
    }

    // 3. Update the record
    const updateSql = `UPDATE patient SET ${fields} WHERE patient_id = ?`;
    const [updateResult] = await pool.query(updateSql, [...values, patient_id]);

    if (updateResult.affectedRows === 0) {
        // If affectedRows is 0 but record existed, usually means no change was needed
         console.warn(`Patient ${patient_id} found but not updated. Might be no changes.`);
    }

    // 4. Fetch the updated record to return
    const [updatedPatient] = await executePoolQuery(pool, findSql, [patient_id]);

    console.log("✅ Patient details updated successfully.");

    return new ApiResponse(
      200,
      "Patient details updated successfully.",
      null,
      updatedPatient
    );
  } catch (error) {
    console.error("Error while updating Patient details:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating Patient details.",
      null,
      error.message
    );
  }
}

/**
 * 3. List patient records by date range (Refactored to cleaner MySQL)
 */
async function listPatient(pool, reqQuery) {
  const { location, from, to } = reqQuery;
  const showConfirmedOnly = reqQuery.showConfirmedOnly === 'true'; // Get optional filter

  try {
    if (!location) throw new Error("Missing required field: location");
    if (!from || !to) throw new Error("Missing date range: from/to");

    // Convert DD-MM-YYYY → YYYY-MM-DD for MySQL
    const fromDate = moment(from, "DD-MM-YYYY").format("YYYY-MM-DD");
    const toDate = moment(to, "DD-MM-YYYY").format("YYYY-MM-DD");

    let sql = `
        SELECT *
        FROM patient
        WHERE date BETWEEN ? AND ?
          AND (is_deleted IS NULL OR is_deleted != 1)
    `;

    // Optional filter for confirmed patients
    if (showConfirmedOnly) {
      sql += " AND ConfirmPatient = 1";
    }

    sql += " ORDER BY patient_id DESC;";

    // Execute query
    const patients = await executePoolQuery(pool, sql, [fromDate, toDate]);

    console.log(`✅ Retrieved ${patients.length} patients.`);
    return patients;
  } catch (error) {
    console.error("❌ Error while fetching patients:", error.message);
    // Throw error for controller to wrap in ApiResponse
    throw new Error("Unable to fetch patients.");
  }
}

module.exports = {
  addPatient,
  editPatient,
  listPatient,
};