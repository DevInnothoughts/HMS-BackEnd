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
 * Helper function to fetch doctor name by doctor_id
 */
async function getDoctorName(pool, doctorId) {
    if (!doctorId) return null;
    const [doctor] = await executePoolQuery(pool, `SELECT name FROM doctor WHERE doctor_id = ? LIMIT 1`, [doctorId]);
    return doctor ? doctor.name : null;
}

/**
 * Helper function to fetch ref doctor name and phone
 */
async function getRefDoctorInfo(pool, doctorId) {
    if (!doctorId || isNaN(Number(doctorId))) return null;
    const [doctor] = await executePoolQuery(pool, `SELECT ref_doctor_name, ref_doctor_phone FROM ref_doctor WHERE reference_doctor_id = ? LIMIT 1`, [Number(doctorId)]);
    return doctor ? `${doctor.ref_doctor_name} (${doctor.ref_doctor_phone})` : null;
}

/**
 * Helper function to format date strings for display
 */
function formatDisplayDate(date) {
    if (!date) return null;
    return moment(date).format("DD/MM/YYYY");
}


// -------------------------------------------------------------------------
//                          1. ADD DISCHARGE CARD
// -------------------------------------------------------------------------

async function addDischargeCard(pool, dischargeCardData, patient_id) {
    console.log("Service received request for patient ID:", patient_id);

    try {
        // 1. Check if discharge card already exists
        const checkSql = `SELECT patient_id FROM discharge_card WHERE patient_id = ? LIMIT 1`;
        const existingCard = await executePoolQuery(pool, checkSql, [patient_id]);
        
        if (existingCard.length > 0) {
            return new ApiResponse(400, "Discharge Card already exists for this patient.", null, null);
        }

        // 2. Prepare multiple inserts (using pool.query in parallel is possible, but sequential for simplicity)
        
        // --- Insert discharge_card ---
        const insertCardSql = `
            INSERT INTO discharge_card (
                patient_id, DOA, DOD, DOA_time, DOD_time, investigation, Follow_date, madeby, 
                treatingby, checkedby, surgeryadvice, consultantName, IPDNo, BP, past_history, 
                allergies, diagnosis, local_care, admission_reason, findings, carenote, 
                surgical_procedure, prescriptionAssign
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const cardParams = [
            patient_id, dischargeCardData.DOA, dischargeCardData.DOD, dischargeCardData.DOA_time, 
            dischargeCardData.DOD_time, dischargeCardData.investigation, dischargeCardData.Follow_date, 
            dischargeCardData.madeby, dischargeCardData.treatingby, dischargeCardData.checkedby, 
            dischargeCardData.surgeryadvice, dischargeCardData.consultantName, dischargeCardData.IPDNo, 
            dischargeCardData.BP, dischargeCardData.past_history, dischargeCardData.allergies, 
            dischargeCardData.diagnosis, dischargeCardData.local_care, dischargeCardData.admission_reason, 
            dischargeCardData.findings, dischargeCardData.carenote, dischargeCardData.surgical_procedure, 
            dischargeCardData.prescriptionAssign
        ];
        const [cardResult] = await pool.query(insertCardSql, cardParams);

        // --- Insert discharge_card_details ---
        const insertDetailsSql = `INSERT INTO discharge_card_details (patient_id, surgery_type) VALUES (?, ?)`;
        const [detailsResult] = await pool.query(insertDetailsSql, [patient_id, dischargeCardData.surgery_type]);

        // --- Insert medicine ---
        const insertMedicineSql = `INSERT INTO medicine (patient_id, name, gender_type, medicine_type, status, medicine_dosage) VALUES (?, ?, ?, ?, ?, ?)`;
        const [medicineResult] = await pool.query(insertMedicineSql, [patient_id, dischargeCardData.name, dischargeCardData.gender_type, dischargeCardData.medicine_type, dischargeCardData.status, dischargeCardData.medicine_dosage]);

        // --- Insert prescription_opd ---
        const insertPrescriptionSql = `
            INSERT INTO prescription_opd (patient_id, prescription_type, medicine_name, medicine_quantity, medicine_time, medicine_days) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [prescriptionResult] = await pool.query(insertPrescriptionSql, [
            patient_id, dischargeCardData.prescription_type, dischargeCardData.medicine_name, 
            dischargeCardData.medicine_quantity, dischargeCardData.medicine_time, dischargeCardData.medicine_days
        ]);

        // --- Insert patient (assuming this updates basic patient demographics, check if patient exists first in a real scenario) ---
        // NOTE: This usually UPDATES patientDb, but since the original used .save(), we'll INSERT a dummy if we must.
        // Assuming update/insert logic here:
        const updatePatientSql = `UPDATE patient SET name=?, age=?, sex=?, address=? WHERE patient_id=?`;
        const [patientUpdateResult] = await pool.query(updatePatientSql, [dischargeCardData.name, dischargeCardData.age, dischargeCardData.sex, dischargeCardData.address, patient_id]);
        
        // --- Insert urology ---
        const insertUrologySql = `INSERT INTO urology (patient_id, spo2, pulse, RR, temperature) VALUES (?, ?, ?, ?, ?)`;
        const [urologyResult] = await pool.query(insertUrologySql, [patient_id, dischargeCardData.spo2, dischargeCardData.pulse, dischargeCardData.RR, dischargeCardData.temperature]);

        // --- Insert surgery_details ---
        const insertSurgerySql = `INSERT INTO surgery_details (patient_id, surgery_note, surgery_remarks) VALUES (?, ?, ?)`;
        const [surgeryResult] = await pool.query(insertSurgerySql, [patient_id, dischargeCardData.surgery_note, dischargeCardData.surgery_remarks]);


        return new ApiResponse(
            201,
            "Discharge card and related details registered successfully.",
            null,
            {
                dischargeCardInsertId: cardResult.insertId,
                patientUpdateResult: patientUpdateResult, // Using update result
            },
        );
    } catch (error) {
        console.error("Error while registering discharge card details: ", error.message);
        return new ApiResponse(500, "Exception while registration.", null, error.message);
    }
}


// -------------------------------------------------------------------------
//                          2. UPDATE DISCHARGE CARD
// -------------------------------------------------------------------------

async function updateDischargeCard(pool, patient_id, updatedDischargeCardData) {
    try {
        console.log("Service received request to update discharge card for patient_id:", patient_id);

        // 1. Check if discharge card exists
        const checkSql = `SELECT patient_id FROM discharge_card WHERE patient_id = ? LIMIT 1`;
        const existingCard = await executePoolQuery(pool, checkSql, [patient_id]);

        if (existingCard.length === 0) {
            return new ApiResponse(400, "Discharge Card Data not found for update.", null, null);
        }

        // 2. Prepare dynamic update for discharge_card table
        const cardFields = Object.keys(updatedDischargeCardData).filter(key => key !== 'patient_id');
        
        if (cardFields.length > 0) {
            const setClauses = cardFields.map(field => `${field} = ?`).join(', ');
            const updateValues = cardFields.map(field => updatedDischargeCardData[field]);
            updateValues.push(patient_id); 

            const updateCardSql = `UPDATE discharge_card SET ${setClauses} WHERE patient_id = ? LIMIT 1`;
            await pool.query(updateCardSql, updateValues);
        }

        // 3. Update related tables (Simplifying logic to directly update/upsert)

        // Update discharge_card_details (surgery_type)
        if (updatedDischargeCardData.surgery_type !== undefined) {
             const updateDetailsSql = `INSERT INTO discharge_card_details (patient_id, surgery_type) VALUES (?, ?) ON DUPLICATE KEY UPDATE surgery_type=VALUES(surgery_type)`;
             await pool.query(updateDetailsSql, [patient_id, updatedDischargeCardData.surgery_type]);
        }
        
        // Update prescription_opd
        const updatePrescriptionSql = `
            INSERT INTO prescription_opd (patient_id, prescription_type, medicine_name, medicine_quantity, medicine_time, medicine_days)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                prescription_type=VALUES(prescription_type), medicine_name=VALUES(medicine_name), 
                medicine_quantity=VALUES(medicine_quantity), medicine_time=VALUES(medicine_time), medicine_days=VALUES(medicine_days)
        `;
        const prescriptionParams = [
             patient_id, updatedDischargeCardData.prescription_type, updatedDischargeCardData.medicine_name, 
             updatedDischargeCardData.medicine_quantity, updatedDischargeCardData.medicine_time, updatedDischargeCardData.medicine_days
        ];
        await pool.query(updatePrescriptionSql, prescriptionParams);


        // Update patient details (name, age, sex, address)
        const updatePatientSql = `
            UPDATE patient SET name=?, age=?, sex=?, address=? WHERE patient_id=?
        `;
        const patientParams = [updatedDischargeCardData.name, updatedDischargeCardData.age, updatedDischargeCardData.sex, updatedDischargeCardData.address, patient_id];
        await pool.query(updatePatientSql, patientParams);


        // Update urology details
        const updateUrologySql = `
            INSERT INTO urology (patient_id, spo2, pulse, RR, temperature)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE spo2=VALUES(spo2), pulse=VALUES(pulse), RR=VALUES(RR), temperature=VALUES(temperature)
        `;
        const urologyParams = [patient_id, updatedDischargeCardData.spo2, updatedDischargeCardData.pulse, updatedDischargeCardData.RR, updatedDischargeCardData.temperature];
        await pool.query(updateUrologySql, urologyParams);


        // Update surgery details
        if (updatedDischargeCardData.surgery_note !== undefined) {
            const updateSurgerySql = `
                 INSERT INTO surgery_details (patient_id, surgery_note)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE surgery_note=VALUES(surgery_note)
            `;
            await pool.query(updateSurgerySql, [patient_id, updatedDischargeCardData.surgery_note]);
        }

        // 4. Return success (we won't re-fetch all updated data due to complexity, just return a confirmation)
        return new ApiResponse(
            200,
            "Discharge card and related details updated successfully.",
            null,
            { patient_id: patient_id },
        );

    } catch (error) {
        console.error("Error while updating discharge card:", error.message);
        return new ApiResponse(500, "Exception while updating discharge card.", null, error.message);
    }
}


// -------------------------------------------------------------------------
//                          3. LIST DISCHARGE CARD
// -------------------------------------------------------------------------

async function listDischargeCard(pool, patient_id) {
    console.log("Service received request to list Discharge card for patient_id:", patient_id);

    try {
        // 1. Fetch main discharge card data
        const cardSql = `SELECT * FROM discharge_card WHERE patient_id = ? LIMIT 1`;
        let [dischargeCardData] = await executePoolQuery(pool, cardSql, [patient_id]);
        
        if (!dischargeCardData) {
            return new ApiResponse(404, "No discharge card data found for the provided patient_id.", null, null);
        }

        // 2. Fetch all related data in parallel
        const [
            prescriptionOpdData,
            patientRows,
            medicineData,
            dischargeCardDetailsData,
            urologyData,
            surgeryData,
        ] = await Promise.all([
            executePoolQuery(pool, `SELECT * FROM prescription_opd WHERE patient_id = ?`, [patient_id]),
            executePoolQuery(pool, `SELECT * FROM patient WHERE patient_id = ? LIMIT 1`, [patient_id]),
            executePoolQuery(pool, `SELECT * FROM medicine WHERE patient_id = ?`, [patient_id]),
            executePoolQuery(pool, `SELECT * FROM discharge_card_details WHERE patient_id = ?`, [patient_id]),
            executePoolQuery(pool, `SELECT * FROM urology WHERE patient_id = ?`, [patient_id]),
            executePoolQuery(pool, `SELECT * FROM surgery_details WHERE patient_id = ?`, [patient_id]),
        ]);
        
        const patientData = patientRows[0];


        // 3. Enrich and format dischargeCardData
        
        // Convert doctor IDs to names (madeby, treatingby, checkedby, consultantName, prescriptionAssign)
        const doctorFields = ['madeby', 'treatingby', 'checkedby', 'consultantName', 'prescriptionAssign'];
        await Promise.all(doctorFields.map(async (field) => {
            const doctorId = dischargeCardData[field];
            dischargeCardData[field] = await getDoctorName(pool, doctorId);
        }));

        // Format dates
        dischargeCardData.DOA = formatDisplayDate(dischargeCardData.DOA);
        dischargeCardData.DOD = formatDisplayDate(dischargeCardData.DOD);
        dischargeCardData.Follow_date = formatDisplayDate(dischargeCardData.Follow_date);

        // Convert patient ref ID to concatenated name/phone string
        if (patientData && patientData.ref) {
            patientData.ref = await getRefDoctorInfo(pool, patientData.ref);
        }
        

        return new ApiResponse(200, "Discharge card fetched successfully.", null, {
            dischargeCardData,
            prescriptionOpdData,
            patientData,
            medicineData,
            dischargeCardDetailsData,
            urologyData,
            surgeryData,
        });

    } catch (error) {
        console.error("Error while fetching discharge card:", error.message);
        return new ApiResponse(500, "Exception while fetching discharge card.", null, error.message);
    }
}


module.exports = {
  addDischargeCard,
  updateDischargeCard,
  listDischargeCard,
};