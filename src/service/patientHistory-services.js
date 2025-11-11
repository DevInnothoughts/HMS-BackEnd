const ApiResponse = require("../utils/api-response");
const moment = require("moment");
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

// -------------------------------------------------------------------------
//                          CORE OPERATIONS
// -------------------------------------------------------------------------

/**
 * 1. Update history check (Converted to MySQL)
 */
async function updateHistoryChk(pool, patient_id) {
  try {
    console.log("Service received request to update historyChk:", patient_id);

    if (!patient_id) {
      return new ApiResponse(400, "Invalid patient_id.", null, null);
    }
    
    // Find the appointment associated with the provided `patient_id`
    const appointmentSql = `SELECT appointment_id FROM appointment WHERE patient_id = ? LIMIT 1`;
    const [appointment] = await executePoolQuery(pool, appointmentSql, [patient_id]);

    if (!appointment) {
      return new ApiResponse(404, "Appointment not found.", null, null);
    }

    // Update the `historychk` field in the appointment
    const updateSql = `UPDATE appointment SET historychk = 3 WHERE patient_id = ? LIMIT 1`;
    const [updateResult] = await pool.query(updateSql, [patient_id]);

    if (updateResult.affectedRows === 0) {
      console.error("Failed to update historyChk for patient_id:", patient_id);
      return new ApiResponse(500, "Error while updating historyChk.", null, null);
    }

    // Fetch the updated appointment document
    const [updatedAppointment] = await executePoolQuery(pool, appointmentSql, [patient_id]);

    console.log("historyChk successfully updated for patient_id:", patient_id);
    return new ApiResponse(
      200,
      "History flag updated successfully.",
      updatedAppointment,
      null,
    );
  } catch (error) {
    console.error("Error while updating historyChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

/**
 * 2. Add Patient, Medication, and Surgical History (Converted to MySQL)
 */
async function addPatientHistory(pool, patientData, patient_id) {
  console.log("Service received request for patient ID:", patient_id);

  try {
    // 1. Fetch doctor_id
    let doctor_id = null;
    if (patientData.name) {
        const doctorSql = `SELECT doctor_id FROM doctor WHERE name = ? LIMIT 1`;
        const [doctor] = await executePoolQuery(pool, doctorSql, [patientData.name]);
        if (doctor) doctor_id = doctor.doctor_id;
    }

    // 2. Insert into patient_history
    const insertHistorySql = `
        INSERT INTO patient_history (
            patient_id, doctor_id, patient_date, height, weight, painscale, BP, Pulse, RR, RS, CVS, CNS, PA, 
            family_history, general_history, past_history, habits, drugs_allery, complaints, presentcomplaints, 
            ongoing_medicines, investigation, knowncaseof, diagnosis, symptoms, medical_mx, comment, 
            piles_duration, fistula_duration, varicose_duration, Urinary_incontinence_duration, 
            Fecal_incontinence_duration, hernia_duration, ODS_duration, pilonidalsinus, circumcision
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `;
    const historyParams = [
        patient_id, doctor_id, patientData.patient_date, patientData.height, patientData.weight, patientData.painscale, 
        patientData.BP, patientData.Pulse, patientData.RR, patientData.RS, patientData.CVS, patientData.CNS, patientData.PA, 
        patientData.family_history, patientData.general_history, patientData.past_history, patientData.habits, 
        patientData.drugs_allery, patientData.complaints, patientData.presentcomplaints, patientData.ongoing_medicines, 
        patientData.investigation, patientData.knowncaseof, patientData.diagnosis, patientData.symptoms, 
        patientData.medical_mx, patientData.comment, patientData.piles_duration, patientData.fistula_duration, 
        patientData.varicose_duration, patientData.Urinary_incontinence_duration, patientData.Fecal_incontinence_duration, 
        patientData.hernia_duration, patientData.ODS_duration, patientData.pilonidalsinus, patientData.circumcision,
    ];
    const [historyResult] = await pool.query(insertHistorySql, historyParams);
    
    // 3. Insert into medication_history
    const insertMedicationSql = `
        INSERT INTO medication_history (patient_id, medicine, indication, since) 
        VALUES (?, ?, ?, ?)
    `;
    const medicationParams = [
        patient_id, patientData.medicine, patientData.indication, patientData.since,
    ];
    const [medicationResult] = await pool.query(insertMedicationSql, medicationParams);

    // 4. Insert into surgical_history (Used dischargeCardDb for surgical history in original)
    // Assuming the surgical history is a simple string column in a table called surgical_history
    const insertSurgicalSql = `
        INSERT INTO surgical_history (patient_id, surgical_history_desc) 
        VALUES (?, ?)
    `;
    const [surgicalResult] = await pool.query(insertSurgicalSql, [patient_id, patientData.surgical_history]);

    // 5. Update `historychk` in `appointment`
    await updateHistoryChk(pool, patient_id);

    // Return a successful response
    return new ApiResponse(
      201,
      "Patient history registered successfully. historyChk updated.",
      null,
      {
        patientHistoryInsertId: historyResult.insertId,
        medicationHistoryInsertId: medicationResult.insertId,
        surgicalHistoryInsertId: surgicalResult.insertId,
      },
    );
  } catch (error) {
    console.error("Error while registering patient history:", error.message);
    return new ApiResponse(
      500,
      "Exception while registering patient history.",
      null,
      error.message,
    );
  }
}

/**
 * 3. Update Patient History and Related Tables (Converted to MySQL)
 */
async function updatePatientHistory(pool, patient_id, updatedPatientHistoryData) {
  try {
    console.log("Service received request to update PatientHistory for patient_id:", patient_id);

    // 1. Fetch current patient history data
    const checkHistorySql = `SELECT * FROM patient_history WHERE patient_id = ? LIMIT 1`;
    let [existingHistory] = await executePoolQuery(pool, checkHistorySql, [patient_id]);

    if (!existingHistory) {
        // If history doesn't exist, call addHistory logic (simplified by returning error and advising to create)
        // You may want to implement upsert logic here if your tables support it.
        return new ApiResponse(400, "Patient history not found. Please use the addPatientHistory route.", null, null);
    }
    
    // 2. Fetch or update doctor_id
    let doctor_id_to_use = existingHistory.doctor_id;
    if (updatedPatientHistoryData.name) {
        const doctorSql = `SELECT doctor_id FROM doctor WHERE name = ? LIMIT 1`;
        const [doctor] = await executePoolQuery(pool, doctorSql, [updatedPatientHistoryData.name]);
        if (doctor) {
            doctor_id_to_use = doctor.doctor_id;
        } else {
            console.warn(`Doctor with name ${updatedPatientHistoryData.name} not found during update.`);
        }
    }
    updatedPatientHistoryData.doctor_id = doctor_id_to_use;


    // 3. Update patient_history
    const historyUpdateFields = Object.keys(updatedPatientHistoryData).filter(key => 
        // Exclude medication/surgical history specific fields
        !['medicine', 'indication', 'since', 'surgical_history'].includes(key)
    );

    if (historyUpdateFields.length > 0) {
        const historySetClauses = historyUpdateFields.map(field => `${field} = ?`).join(', ');
        const historyUpdateValues = historyUpdateFields.map(field => updatedPatientHistoryData[field]);
        historyUpdateValues.push(patient_id);

        const updateHistorySql = `UPDATE patient_history SET ${historySetClauses} WHERE patient_id = ? LIMIT 1`;
        await pool.query(updateHistorySql, historyUpdateValues);
    }


    // 4. Update medication_history (using ON DUPLICATE KEY UPDATE)
    const updateMedicationSql = `
        INSERT INTO medication_history (patient_id, medicine, indication, since) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            medicine = VALUES(medicine), indication = VALUES(indication), since = VALUES(since);
    `;
    const medicationParams = [
        patient_id, 
        updatedPatientHistoryData.medicine, 
        updatedPatientHistoryData.indication, 
        updatedPatientHistoryData.since
    ];
    await pool.query(updateMedicationSql, medicationParams);


    // 5. Update surgical_history
    const updateSurgicalSql = `
        INSERT INTO surgical_history (patient_id, surgical_history_desc) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE surgical_history_desc = VALUES(surgical_history_desc);
    `;
    await pool.query(updateSurgicalSql, [patient_id, updatedPatientHistoryData.surgical_history]);


    // 6. Return the updated history record
    const [updatedPatientHistory] = await executePoolQuery(pool, checkHistorySql, [patient_id]);
    
    console.log("Patient history and related data updated successfully.");
    return new ApiResponse(
        200,
        "Patient history updated successfully.",
        null,
        updatedPatientHistory,
    );

  } catch (error) {
    console.error("Error while updating or creating PatientHistory:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating or creating PatientHistory.",
      null,
      error.message,
    );
  }
}

/**
 * 4. List Patient History and Related Tables (Converted to MySQL)
 */
async function listPatientHistory(pool, patient_id) {
  console.log("Service received request to list patient history for patient_id:", patient_id);

  try {
    // 1. Fetch Patient History
    const historySql = `SELECT * FROM patient_history WHERE patient_id = ? LIMIT 1`;
    const [patientHistory] = await executePoolQuery(pool, historySql, [patient_id]);

    if (!patientHistory) {
      return new ApiResponse(404, "Patient history not found for the provided patient_id", null, null);
    }

    // 2. Fetch related data in parallel
    const [medicationHistory, surgicalHistory, doctorInfo] = await Promise.all([
        executePoolQuery(pool, `SELECT * FROM medication_history WHERE patient_id = ?`, [patient_id]),
        executePoolQuery(pool, `SELECT surgical_history_desc AS surgical_history FROM surgical_history WHERE patient_id = ?`, [patient_id]),
        executePoolQuery(pool, `SELECT doctor_id, name FROM doctor WHERE doctor_id = ? LIMIT 1`, [patientHistory.doctor_id]),
    ]);

    // 3. Prepare the response data
    const responseData = {
      patientHistory: patientHistory,
      medicationHistory,
      surgicalHistory,
      doctor: doctorInfo[0] ? { name: doctorInfo[0].name, id: doctorInfo[0].doctor_id } : null,
    };

    return new ApiResponse(
      200,
      "Patient and medication history fetched successfully.",
      null,
      responseData,
    );
  } catch (error) {
    console.error("Error while fetching patient history:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching patient history.",
      null,
      error.message,
    );
  }
}


module.exports = {
  addPatientHistory,
  updatePatientHistory,
  listPatientHistory,
  updateHistoryChk,
};