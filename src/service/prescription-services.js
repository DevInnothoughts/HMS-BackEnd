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

// -------------------------------------------------------------------------
//                          1. ADD PRESCRIPTION
// -------------------------------------------------------------------------

async function addPrescription(pool, patient_id, prescriptionData) {
    console.log("Service received request for patient ID:", patient_id);

    try {
        // 1. Check if prescription already exists for this patient_id
        const checkSql = `SELECT patient_id FROM prescription_opd WHERE patient_id = ? LIMIT 1`;
        const existingPrescription = await executePoolQuery(pool, checkSql, [patient_id]);
        
        if (existingPrescription.length > 0) {
            return new ApiResponse(
                400,
                "Prescription already exists for the provided patient_id. Use updatePrescription instead.",
                null,
                null,
            );
        }

        // 2. Insert into prescription_opd
        const insertPrescriptionSql = `
            INSERT INTO prescription_opd (
                patient_id, prescription_type, allergy, diagnosis, advicesx, admmisionnote, medicine_name, 
                medicine_time, medicine_quantity, medicine_days, next_appointment, next_appointmentDate, 
                prescription_date, assistant_doctor, surgeryadvice
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const prescriptionParams = [
            patient_id, prescriptionData.prescription_type, prescriptionData.allergy, prescriptionData.diagnosis, 
            prescriptionData.advicesx, prescriptionData.admmisionnote, prescriptionData.medicine_name, 
            prescriptionData.medicine_time, prescriptionData.medicine_quantity, prescriptionData.medicine_days, 
            prescriptionData.next_appointment, prescriptionData.next_appointmentDate, prescriptionData.prescription_date, 
            prescriptionData.assistant_doctor, prescriptionData.surgeryadvice,
        ];
        const [prescriptionResult] = await pool.query(insertPrescriptionSql, prescriptionParams);

        // 3. Insert into urology (for investigation)
        const insertUrologySql = `INSERT INTO urology (patient_id, investigation) VALUES (?, ?)`;
        const [urologyResult] = await pool.query(insertUrologySql, [patient_id, prescriptionData.investigation]);
        console.log("urology successfully registered. Insert ID:", urologyResult.insertId);

        // 4. Insert into appointment (for next appointment details)
        const insertAppointmentSql = `
            INSERT INTO appointment (patient_id, patient_type, appointment_timestamp) 
            VALUES (?, ?, ?)
        `;
        const [appointmentResult] = await pool.query(insertAppointmentSql, [
            patient_id, 
            prescriptionData.patient_type, 
            prescriptionData.appointment_timestamp
        ]);
        console.log("appointment successfully registered. Insert ID:", appointmentResult.insertId);

        // 5. Return success
        return new ApiResponse(201, "Prescription registered successfully.", null, {
            prescriptionInsertId: prescriptionResult.insertId,
            appointmentInsertId: appointmentResult.insertId,
            urologyInsertId: urologyResult.insertId,
        });

    } catch (error) {
        console.error("Error while registering prescription: ", error.message);
        return new ApiResponse(500, "Exception while prescription registration.", null, error.message);
    }
}

// -------------------------------------------------------------------------
//                          2. UPDATE PRESCRIPTION
// -------------------------------------------------------------------------

async function updatePrescription(pool, patient_id, updatedOpd_prescriptionData) {
  try {
    console.log("Service received request to update prescription for patient_id:", patient_id);

    // 1. Check if prescription exists
    const checkPrescriptionSql = `SELECT patient_id FROM prescription_opd WHERE patient_id = ? LIMIT 1`;
    const [existingPrescription] = await executePoolQuery(pool, checkPrescriptionSql, [patient_id]);

    if (!existingPrescription) {
      return new ApiResponse(
        400,
        "Prescription data not found for update.",
        null,
        null,
      );
    }

    // 2. Prepare dynamic update for prescription_opd
    const prescriptionFields = Object.keys(updatedOpd_prescriptionData).filter(key => 
        !['investigation', 'patient_type', 'appointment_timestamp'].includes(key) && key !== 'patient_id'
    );
    
    if (prescriptionFields.length > 0) {
        const setClauses = prescriptionFields.map(key => `${key} = ?`).join(', ');
        const updateValues = prescriptionFields.map(key => updatedOpd_prescriptionData[key]);
        updateValues.push(patient_id); 

        const updatePrescriptionSql = `UPDATE prescription_opd SET ${setClauses} WHERE patient_id = ? LIMIT 1`;
        await pool.query(updatePrescriptionSql, updateValues);
    }

    // 3. Update urology (for investigation) - Using ON DUPLICATE KEY UPDATE (requires investigation to be unique/primary key)
    const updateUrologySql = `
        INSERT INTO urology (patient_id, investigation)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE investigation = VALUES(investigation);
    `;
    const urologyParams = [
        patient_id, 
        updatedOpd_prescriptionData.investigation,
    ];
    await pool.query(updateUrologySql, urologyParams);

    // 4. Update appointment (patient_type and appointment_timestamp) - Using ON DUPLICATE KEY UPDATE
    const updateAppointmentSql = `
        INSERT INTO appointment (patient_id, patient_type, appointment_timestamp)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            patient_type = VALUES(patient_type), 
            appointment_timestamp = VALUES(appointment_timestamp);
    `;
    const appointmentParams = [
        patient_id,
        updatedOpd_prescriptionData.patient_type,
        updatedOpd_prescriptionData.appointment_timestamp,
    ];
    await pool.query(updateAppointmentSql, appointmentParams);

    // 5. Fetch updated records to return
    const [updatedPrescription] = await executePoolQuery(pool, `SELECT * FROM prescription_opd WHERE patient_id = ? LIMIT 1`, [patient_id]);
    const [updatedUrology] = await executePoolQuery(pool, `SELECT * FROM urology WHERE patient_id = ? LIMIT 1`, [patient_id]);
    const [updatedAppointment] = await executePoolQuery(pool, `SELECT * FROM appointment WHERE patient_id = ? LIMIT 1`, [patient_id]);


    return new ApiResponse(200, "Prescription updated successfully.", null, {
        prescription: updatedPrescription,
        appointment: updatedAppointment,
        urology: updatedUrology,
    });
  } catch (error) {
    console.error("Error while updating prescription:", error.message);
    return new ApiResponse(500, "Exception while updating prescription.", null, error.message);
  }
}

// -------------------------------------------------------------------------
//                          3. LIST PRESCRIPTION
// -------------------------------------------------------------------------

async function listPrescription(pool, patient_id) {
  console.log("Service received request to list prescription for patient_id:", patient_id);

  try {
    // 1. Fetch prescription
    const prescriptionSql = `SELECT * FROM prescription_opd WHERE patient_id = ? LIMIT 1`;
    const [prescription] = await executePoolQuery(pool, prescriptionSql, [patient_id]);

    if (!prescription) {
      return new ApiResponse(404, "Patient prescription not found for the provided patient_id", null, null);
    }

    // 2. Fetch related data in parallel
    const [urology, appointment] = await Promise.all([
        executePoolQuery(pool, `SELECT * FROM urology WHERE patient_id = ?`, [patient_id]),
        executePoolQuery(pool, `SELECT * FROM appointment WHERE patient_id = ?`, [patient_id]),
    ]);
    
    // 3. Return the successful response
    return new ApiResponse(200, "Prescription fetched successfully.", null, {
      prescription,
      appointment,
      urology,
    });
  } catch (error) {
    console.error("Error while fetching patient prescription:", error.message);
    return new ApiResponse(500, "Exception while fetching patient prescription.", null, error.message);
  }
}

module.exports = {
  addPrescription,
  updatePrescription,
  listPrescription,
};