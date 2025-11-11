const ApiResponse = require("../utils/api-response");
const moment = require("moment"); 
// Assuming the formatDate utility is a synchronous function that returns DD/MM/YYYY string
const { formatDate } = require("../utils/formatDate.js");
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
 * 1. Get Patient Personal Details (Converted to MySQL)
 */
async function personal(pool, patient_id) {
  try {
    // 1. Fetch patient data
    const sql = `SELECT * FROM patient WHERE patient_id = ? AND (is_deleted IS NULL OR is_deleted != 1) LIMIT 1`;
    const [patient] = await executePoolQuery(pool, sql, [patient_id]);

    if (!patient) {
      // Throw a standard error that the controller can catch and format
      throw new Error("Patient not found.");
    }
    
    // 2. Format dates for display (assuming formatDate handles MySQL date/timestamp objects/strings)
    patient.date = formatDate(patient.date);
    patient.birth_date = formatDate(patient.birth_date);

    return {
      statusCode: 200,
      message: "Personal details fetched successfully.",
      data: patient,
    };
  } catch (error) {
    console.error("Error while fetching patient personal details: ", error.message);
    throw new Error(`Unable to fetch patient personal details: ${error.message}`);
  }
}

/**
 * 2. Edit Patient Personal Details (Converted to MySQL)
 */
async function editPersonal(pool, patient_id, updatedData) {
  try {
    // 1. Find the patient by patient_id
    const findSql = `SELECT * FROM patient WHERE patient_id = ? AND (is_deleted IS NULL OR is_deleted != 1) LIMIT 1`;
    const [patientData] = await executePoolQuery(pool, findSql, [patient_id]);

    if (!patientData) {
      return new ApiResponse(400, "Patient not found for update", null, null);
    }
    
    // 2. Merge existing data for dynamic update logic
    // We filter out patient_id and any null/undefined values to build the SET clause.
    const updatePayload = Object.keys(updatedData).reduce((acc, key) => {
        if (key !== 'patient_id' && updatedData[key] !== undefined) {
            acc[key] = updatedData[key];
        }
        return acc;
    }, {});
    
    const fields = Object.keys(updatePayload);
    if (fields.length === 0) {
        return new ApiResponse(200, "No data provided for update.", null, patientData);
    }

    // 3. Build dynamic SQL SET clause
    const setClauses = fields.map(key => `${key} = ?`).join(', ');
    const values = fields.map(key => updatePayload[key]);
    values.push(patient_id); // For WHERE clause

    // 4. Update the record
    const updateSql = `UPDATE patient SET ${setClauses} WHERE patient_id = ? LIMIT 1`;
    const [updateResult] = await pool.query(updateSql, values);

    if (updateResult.affectedRows === 0) {
      // If affectedRows is 0, it means the record was found but no data was changed.
      console.warn(`Patient ${patient_id} found but not updated. Might be no changes.`);
    }

    // 5. Fetch the updated record to return
    const [updatedPatient] = await executePoolQuery(pool, findSql, [patient_id]);
    
    if (!updatedPatient) {
        // Should not happen if update succeeded, but as a safeguard:
        return new ApiResponse(500, "Error fetching updated patient data.", null, null);
    }

    // 6. Format dates in the response object
    updatedPatient.date = formatDate(updatedPatient.date);
    updatedPatient.birth_date = formatDate(updatedPatient.birth_date);
    
    // Return a success response with updated patient details
    return new ApiResponse(
      200,
      "Patient details updated successfully.",
      null,
      updatedPatient,
    );
  } catch (error) {
    // Log the error and return a failure response
    console.error("Error while updating patient details:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating patient details.",
      null,
      error.message,
    );
  }
}

module.exports = {
  personal,
  editPersonal,
};