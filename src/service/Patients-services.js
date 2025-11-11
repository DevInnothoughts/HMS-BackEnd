const ApiResponse = require("../utils/api-response");
const moment = require("moment"); // Use moment for safer date handling
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

// Helper function to format date to DD/MM/YYYY for display (using moment)
function formatDateToDDMMYYYY(date) {
  if (!date) return null;
  return moment(date).format("DD/MM/YYYY");
}

/**
 * 1. List Patients Function (Converted to MySQL)
 */
async function listPatient(pool) {
  try {
    // MySQL query to fetch and sort patient data
    const sql = `
        SELECT 
            patient_id, Uid_no, name, phone, age, sex, email, address, date, patient_type
        FROM patient
        WHERE (is_deleted IS NULL OR is_deleted != 1)
        ORDER BY patient_id DESC
        LIMIT 5000;
    `;
    
    const patients = await executePoolQuery(pool, sql);

    // Format the date for each patient
    return patients.map((patient) => ({
      ...patient,
      date: formatDateToDDMMYYYY(patient.date), // Format date field
    }));
  } catch (error) {
    console.error("Error while fetching patients: ", error.message);
    throw new Error("Unable to fetch patients.");
  }
}

/**
 * 2. List Referral Doctors Function (Converted to MySQL)
 */
async function listDoctor(pool) {
  try {
    // MySQL query to fetch all referral doctors
    const sql = `
        SELECT 
            reference_doctor_id, ref_doctor_name, ref_doctor_phone, 
            reference_doctor_speciality, reference_doctor_location
        FROM ref_doctor
        WHERE (is_deleted IS NULL OR is_deleted != 1)
        ORDER BY ref_doctor_name ASC;
    `;
    
    const doctorList = await executePoolQuery(pool, sql);
    
    return doctorList;
  } catch (error) {
    console.error("Error while fetching doctor: ", error.message);
    throw new Error("Unable to fetch doctor.");
  }
}

/**
 * 3. List Referral Patient Details by Phone (Converted to MySQL)
 */
async function listRefPatient(pool, phone) {
  console.log("Service received request to list ref patient for phone:", phone);

  try {
    // MySQL query to find patient by phone with specific projection
    const sql = `
        SELECT 
            name, pincode, phone, patient_id
        FROM patient
        WHERE phone = ? AND (is_deleted IS NULL OR is_deleted != 1)
        LIMIT 1;
    `;
    
    const [refPatientData] = await executePoolQuery(pool, sql, [phone]);

    if (!refPatientData) {
         return new ApiResponse(404, "Ref patient not found.", null, null);
    }
    
    console.log("Fetched ref patient:", refPatientData);

    return new ApiResponse(200, "Ref patient fetched successfully.", null, {
      refPatientData,
    });
  } catch (error) {
    console.error("Error while fetching ref patient:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching ref patient.",
      null,
      error.message,
    );
  }
}

module.exports = {
  listPatient,
  listDoctor,
  listRefPatient,
};