const ApiResponse = require("../utils/api-response");
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
 * 1. List Follow-Up Data for a single patient (Converted to MySQL)
 */
async function listFollowUp(pool, patient_id) {
  try {
    // 1. Fetch patient details
    const patientSql = `SELECT * FROM patient WHERE patient_id = ? LIMIT 1`;
    const [patientData] = await executePoolQuery(pool, patientSql, [patient_id]);
    
    // 2. Fetch diagnosis data
    // Assuming diagnosis is one-to-many, so we list all
    const diagnosisSql = `SELECT * FROM diagnosis WHERE patient_id = ? AND (is_deleted IS NULL OR is_deleted != 1)`;
    const diagnosisData = await executePoolQuery(pool, diagnosisSql, [patient_id]);
    
    // 3. Fetch latest follow-up data
    // Assuming follow_up is typically one-to-one or we fetch the most recent
    const followUpSql = `SELECT * FROM follow_up WHERE patient_id = ? ORDER BY follow_up_id DESC LIMIT 1`;
    const [followUpData] = await executePoolQuery(pool, followUpSql, [patient_id]);

    return new ApiResponse(
      200,
      "Patient and follow-up history fetched successfully.",
      null,
      { patientData: patientData, diagnosisData, followUpData },
    );
  } catch (error) {
    console.error("Error while fetching followUp data: ", error.message);
    throw new Error("Unable to fetch followUp data.");
  }
}

/**
 * 2. Update Follow-Up Data, Patient Details, and Diagnosis (Converted to MySQL)
 */
async function followUp(pool, patient_id, updatedFollowUpData) {
  try {
    console.log("Service received request to update follow up for patient_id:", patient_id);

    // --- 1. Update follow_up table (Check existence/Insert on duplicate key) ---
    // We assume followUpData holds data from the last record if one exists,
    // and we update that last record, or insert if none exists.
    
    // Find the latest follow-up record to use existing data if fields are missing in payload
    const followUpSql = `SELECT * FROM follow_up WHERE patient_id = ? ORDER BY follow_up_id DESC LIMIT 1`;
    const [existingFollowUp] = await executePoolQuery(pool, followUpSql, [patient_id]);

    if (!existingFollowUp) {
         // Insert initial follow up record
         const insertFollowUpSql = `INSERT INTO follow_up (patient_id, advice, adviceComment, diagnosis) VALUES (?, ?, ?, ?)`;
         const insertFollowUpParams = [patient_id, updatedFollowUpData.advice || null, updatedFollowUpData.adviceComment || null, updatedFollowUpData.diagnosis || null];
         await pool.query(insertFollowUpSql, insertFollowUpParams);
    } else {
        // Update existing follow up record
        const updateFollowUpSql = `
            UPDATE follow_up SET 
                advice = ?, 
                adviceComment = ?, 
                diagnosis = ?
            WHERE follow_up_id = ?
            LIMIT 1
        `;
        const updateFollowUpParams = [
            updatedFollowUpData.advice || existingFollowUp.advice,
            updatedFollowUpData.adviceComment || existingFollowUp.adviceComment,
            updatedFollowUpData.diagnosis || existingFollowUp.diagnosis,
            existingFollowUp.follow_up_id 
        ];
        await pool.query(updateFollowUpSql, updateFollowUpParams);
    }

    // --- 2. Update patient table ---
    const updatePatientSql = `
      UPDATE patient
      SET 
        Uid_no = ?,
        age = ?,
        phone = ?
      WHERE patient_id = ?
      LIMIT 1
    `;
    const updatePatientParams = [
      updatedFollowUpData.Uid_no,
      updatedFollowUpData.age,
      updatedFollowUpData.phone,
      patient_id,
    ];
    const [patientResult] = await pool.query(updatePatientSql, updatePatientParams);

    if (patientResult.affectedRows === 0) {
      // Note: This often means the patient_id wasn't found or no change was made
      console.warn("Patient record not updated or not found:", patient_id);
    }

    // --- 3. Update diagnosis table ---
    // Note: This updates fields in the diagnosis table based on follow up data.
    const updateDiagnosisSql = `
      UPDATE diagnosis
      SET 
        advice = ?,
        adviceComment = ?,
        diagnosis = ?
      WHERE patient_id = ?
      LIMIT 1
    `;
    const updateDiagnosisParams = [
      updatedFollowUpData.advice,
      updatedFollowUpData.adviceComment,
      updatedFollowUpData.diagnosis,
      patient_id,
    ];
    const [diagnosisResult] = await pool.query(updateDiagnosisSql, updateDiagnosisParams);

    if (diagnosisResult.affectedRows === 0) {
        console.warn("Diagnosis record not updated or not found:", patient_id);
    }

    // --- 4. Return the updated data (Re-fetch the records to ensure consistency) ---
    const [updatedFollowUp] = await executePoolQuery(pool, followUpSql, [patient_id]);
    const [updatedPatient] = await executePoolQuery(pool, patientSql, [patient_id]);
    const [updatedDiagnosis] = await executePoolQuery(pool, `SELECT * FROM diagnosis WHERE patient_id = ? LIMIT 1`, [patient_id]);


    return new ApiResponse(
      200,
      "Follow up, patient, and diagnosis updated successfully.",
      null,
      {
        followUp: updatedFollowUp,
        patient: updatedPatient,
        diagnosis: updatedDiagnosis,
      },
    );
  } catch (error) {
    console.error("Error while updating follow up:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating follow up.",
      null,
      error.message,
    );
  }
}

module.exports = {
  followUp,
  listFollowUp,
};