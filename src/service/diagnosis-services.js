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
 * 1. Add Diagnosis and Surgical Advice (Converted to MySQL)
 */
async function addDiagnosis(pool, patient_id, diagnosisData) {
    console.log("Service received request for patient ID:", patient_id);
    if (!patient_id || isNaN(Number(patient_id))) {
        return new ApiResponse(400, "Invalid patient_id provided.", null, null);
    }
    
    try {
        // 1. Check if diagnosis already exists for this patient_id
        const checkDiagnosisSql = `SELECT diagnosis_id FROM diagnosis WHERE patient_id = ? AND (is_deleted IS NULL OR is_deleted != 1) LIMIT 1`;
        const existingDiagnosis = await executePoolQuery(pool, checkDiagnosisSql, [patient_id]);
        
        if (existingDiagnosis.length > 0) {
            return new ApiResponse(
                400,
                "Diagnosis already exists for the provided patient_id. Use updateDiagnosis instead.",
                null,
                null,
            );
        }

        // 2. Fetch doctor_ids for consultantDoctor and assistanceDoctor
        const fetchDoctorIdSql = `SELECT doctor_id FROM doctor WHERE name = ? LIMIT 1`;
        
        let consultantDoctorId = null;
        if (diagnosisData.consultantDoctor) {
            const doctors = await executePoolQuery(pool, fetchDoctorIdSql, [diagnosisData.consultantDoctor]);
            if (doctors.length === 0) {
                return new ApiResponse(404, `Consultant doctor with name ${diagnosisData.consultantDoctor} not found`, null, null);
            }
            consultantDoctorId = doctors[0].doctor_id;
        }

        let assistanceDoctorId = null;
        if (diagnosisData.assistanceDoctor) {
            const doctors = await executePoolQuery(pool, fetchDoctorIdSql, [diagnosisData.assistanceDoctor]);
            if (doctors.length === 0) {
                return new ApiResponse(404, `Assistance doctor with name ${diagnosisData.assistanceDoctor} not found`, null, null);
            }
            assistanceDoctorId = doctors[0].doctor_id;
        }

        // 3. Insert into diagnosis table
        const insertDiagnosisSql = `
            INSERT INTO diagnosis (
                patient_id, diagnosis, advice, date_diagnosis, investigationorders, provisionaldiagnosis, 
                comment, adviceComment, RF, Laser, MW, categoryComment, insurance, insuranceCompany, workshop, 
                consultantDoctor, assistanceDoctor, SurgicalDate, diagnosisAdvice, medicines, other, speciality, symptoms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const diagnosisParams = [
            patient_id, diagnosisData.diagnosis, diagnosisData.advice, diagnosisData.date_diagnosis, diagnosisData.investigationorders, 
            diagnosisData.provisionaldiagnosis, diagnosisData.comment, diagnosisData.adviceComment, diagnosisData.RF, 
            diagnosisData.Laser, diagnosisData.MW, diagnosisData.categoryComment, diagnosisData.insurance, 
            diagnosisData.insuranceCompany, diagnosisData.workshop, consultantDoctorId, assistanceDoctorId, 
            diagnosisData.SurgicalDate, diagnosisData.diagnosisAdvice, diagnosisData.medicines, 
            diagnosisData.other, diagnosisData.speciality, diagnosisData.symptoms,
        ];

        const [diagnosisResult] = await pool.query(insertDiagnosisSql, diagnosisParams);
        console.log("Diagnosis successfully registered. Insert ID:", diagnosisResult.insertId);

        // 4. Insert into surgical_advice table (assuming one-to-one or one-to-many relationship)
        const insertSurgicalAdviceSql = `
            INSERT INTO surgical_advice (
                patient_id, surgical_advice_desc
            ) VALUES (?, ?)
        `;
        const surgicalAdviceParams = [
            patient_id, diagnosisData.surgical_advice_desc,
        ];

        const [surgicalAdviceResult] = await pool.query(insertSurgicalAdviceSql, surgicalAdviceParams);
        console.log("Surgical advice successfully registered. Insert ID:", surgicalAdviceResult.insertId);

        return new ApiResponse(201, "Diagnosis registered successfully.", null, {
            diagnosisInsertId: diagnosisResult.insertId,
            surgicalAdviceInsertId: surgicalAdviceResult.insertId,
        });

    } catch (error) {
        console.error("Error while registering patient diagnosis: ", error.message);
        return new ApiResponse(500, "Exception while patient diagnosis registration.", null, error.message);
    }
}

/**
 * 2. Update Diagnosis and Surgical Advice (Converted to MySQL)
 */
const updateDiagnosis = async (pool, patient_id, updatedDiagnosisData) => {
    try {
        console.log("Service: Updating diagnosis for patient_id:", patient_id);

        // 1. Fetch existing diagnosis to ensure existence (optional, but good practice)
        const checkDiagnosisSql = `SELECT * FROM diagnosis WHERE patient_id = ? AND (is_deleted IS NULL OR is_deleted != 1) LIMIT 1`;
        const existingDiagnosis = await executePoolQuery(pool, checkDiagnosisSql, [patient_id]);
        
        if (existingDiagnosis.length === 0) {
            return new ApiResponse(400, "Diagnosis data not found for update.", null, null);
        }

        // 2. Prepare dynamic update for diagnosis table
        const updateFields = Object.keys(updatedDiagnosisData).filter(key => key !== 'surgical_advice_desc' && key !== 'patient_id');
        
        if (updateFields.length > 0) {
            const setClauses = updateFields.map(field => `${field} = ?`).join(', ');
            const updateValues = updateFields.map(field => updatedDiagnosisData[field]);
            updateValues.push(patient_id); 

            const updateDiagnosisSql = `UPDATE diagnosis SET ${setClauses} WHERE patient_id = ? LIMIT 1`;
            const [updateResult] = await pool.query(updateDiagnosisSql, updateValues);

            if (updateResult.affectedRows === 0) {
                 // Check if it failed due to no changes
                 console.warn(`Diagnosis for patient ${patient_id} found but not updated. Might be no changes.`);
            }
        }
        
        // 3. Update surgical advice table (always update if the field is present in payload)
        if (updatedDiagnosisData.surgical_advice_desc !== undefined) {
            const updateSurgicalAdviceSql = `
                UPDATE surgical_advice
                SET surgical_advice_desc = ?
                WHERE patient_id = ?
                LIMIT 1
            `;
            const [updateAdviceResult] = await pool.query(updateSurgicalAdviceSql, [updatedDiagnosisData.surgical_advice_desc, patient_id]);

            if (updateAdviceResult.affectedRows === 0) {
                // Since Mongo used upsert/findoneandupdate, handle insert if not exists
                const insertAdviceSql = `INSERT INTO surgical_advice (patient_id, surgical_advice_desc) VALUES (?, ?)`;
                await pool.query(insertAdviceSql, [patient_id, updatedDiagnosisData.surgical_advice_desc]);
                console.log(`Surgical advice inserted for patient ${patient_id}`);
            }
        }

        // 4. Fetch the updated records to return
        const updatedDiagnosisRows = await executePoolQuery(pool, checkDiagnosisSql, [patient_id]);
        const updatedSurgicalAdviceRows = await executePoolQuery(pool, `SELECT * FROM surgical_advice WHERE patient_id = ? LIMIT 1`, [patient_id]);


        return new ApiResponse(200, "Diagnosis and surgical advice updated successfully.", null, {
            diagnosis: updatedDiagnosisRows[0] || existingDiagnosis[0],
            surgicalAdvice: updatedSurgicalAdviceRows[0] || null,
        });
        
    } catch (error) {
        console.error("Service: Error while updating diagnosis:", error.message);
        return new ApiResponse(500, "Exception while updating diagnosis.", null, error.message);
    }
};

/**
 * 3. List Diagnosis and Surgical Advice for a single patient (Converted to MySQL)
 */
async function listDiagnosis(pool, patient_id) {
    console.log("Service received request to list diagnosis for patient_id:", patient_id);

    try {
        // 1. Fetch diagnosis data (including foreign keys)
        const diagnosisSql = `SELECT * FROM diagnosis WHERE patient_id = ? AND (is_deleted IS NULL OR is_deleted != 1)`;
        let diagnosisData = await executePoolQuery(pool, diagnosisSql, [patient_id]);
        
        if (diagnosisData.length === 0) {
            return new ApiResponse(404, "No diagnosis data found for the provided patient_id.", null, null);
        }

        // 2. Fetch doctor names (Enrichment - must be run in parallel)
        const enrichedDiagnosisData = await Promise.all(
            diagnosisData.map(async (diagnosis) => {
                const doctorMap = {};
                
                // Fetch consultant doctor name
                if (diagnosis.consultantDoctor) {
                    const [consultantDoctor] = await executePoolQuery(pool, `SELECT name FROM doctor WHERE doctor_id = ? LIMIT 1`, [diagnosis.consultantDoctor]);
                    doctorMap.consultantDoctor = consultantDoctor?.name || "Unknown";
                } else {
                    doctorMap.consultantDoctor = "Unknown";
                }
                
                // Fetch assistance doctor name
                if (diagnosis.assistanceDoctor) {
                    const [assistanceDoctor] = await executePoolQuery(pool, `SELECT name FROM doctor WHERE doctor_id = ? LIMIT 1`, [diagnosis.assistanceDoctor]);
                    doctorMap.assistanceDoctor = assistanceDoctor?.name || "Unknown";
                } else {
                    doctorMap.assistanceDoctor = "Unknown";
                }
                
                // Merge doctor names back into the diagnosis object
                return { ...diagnosis, ...doctorMap };
            })
        );
        
        // 3. Fetch surgical advice data
        const surgicalAdviceSql = `SELECT * FROM surgical_advice WHERE patient_id = ? AND (is_deleted IS NULL OR is_deleted != 1)`;
        const surgicalAdviceData = await executePoolQuery(pool, surgicalAdviceSql, [patient_id]);
        
        console.log("Fetched surgical advice:", surgicalAdviceData);

        return new ApiResponse(200, "Diagnosis fetched successfully.", null, {
            diagnosisData: enrichedDiagnosisData,
            surgicalAdviceData,
        });

    } catch (error) {
        console.error("Error while fetching diagnosis:", error.message);
        return new ApiResponse(500, "Exception while fetching diagnosis.", null, error.message);
    }
}

/**
 * 4. List Diagnosis for all confirmed patients (Converted to MySQL)
 */
async function listAllDiagnosis(pool) {
    console.log("Service received request to list diagnoses for all patients.");

    try {
        // 1. Fetch diagnoses with patient details and initial doctor names using JOINs
        const mainQuerySql = `
            SELECT 
                d.patient_id, d.date_diagnosis, d.diagnosis, d.diagnosisAdvice, d.adviceComment, d.comment,
                d.consultantDoctor AS consultantDoctorId, d.assistanceDoctor AS assistanceDoctorId,
                p.prefix, p.Uid_no, p.name, p.age, p.sex, p.phone, p.ref, p.address, p.ConfirmPatient,
                ch.past_history, -- Assuming patient_history table uses patient_id and has a column 'past_history'
                cd.name AS consultantDoctor,
                ad.name AS assistanceDoctor
            FROM diagnosis d
            JOIN patient p ON d.patient_id = p.patient_id
            LEFT JOIN doctor cd ON d.consultantDoctor = cd.doctor_id
            LEFT JOIN doctor ad ON d.assistanceDoctor = ad.doctor_id
            LEFT JOIN patient_history ch ON d.patient_id = ch.patient_id
            WHERE p.ConfirmPatient = 1
            AND (d.is_deleted IS NULL OR d.is_deleted != 1)
            ORDER BY d.diagnosis_id DESC -- Assuming diagnosis_id is the auto-increment primary key
            LIMIT 500
        `;
        
        const results = await executePoolQuery(pool, mainQuerySql);

        if (results.length === 0) {
            return new ApiResponse(404, "No diagnosis data found for confirmed patients.", null, null);
        }

        // 2. Reformat results to match original MongoDB nested structure (for controller consistency)
        const formattedResults = results.map(row => ({
            patient_id: row.patient_id,
            date_diagnosis: row.date_diagnosis,
            diagnosis: row.diagnosis,
            diagnosisAdvice: row.diagnosisAdvice,
            adviceComment: row.adviceComment,
            comment: row.comment,
            consultantDoctor: row.consultantDoctor || " ", 
            assistanceDoctor: row.assistanceDoctor || " ",
            
            patientDetail: {
                patient_id: row.patient_id,
                prefix: row.prefix,
                Uid_no: row.Uid_no,
                name: row.name,
                age: row.age,
                sex: row.sex,
                phone: row.phone,
                ref: row.ref,
                address: row.address,
                ConfirmPatient: row.ConfirmPatient,
            },
            patientHistoryDetail: {
                past_history: row.past_history || null,
            },
        }));

        console.log("Fetched diagnoses with patient details for confirmed patients:", formattedResults.length);

        return new ApiResponse(200, "Diagnoses fetched successfully.", null, formattedResults);
    } catch (error) {
        console.error("Error while fetching diagnoses:", error.message);
        return new ApiResponse(500, "Exception while fetching diagnoses.", null, error.message);
    }
}

/**
 * 5. Add/Update Doctor Comment (Converted to MySQL)
 */
async function addDoctorComment(pool, patient_id, commentData) {
    console.log("Service received request to update doctor comment for patient_id:", patient_id);

    try {
        // Update the feedback field in the diagnosis table
        const updateSql = `
            UPDATE diagnosis
            SET feedback = ?
            WHERE patient_id = ?
            LIMIT 1;
        `;
        
        const [updateResult] = await pool.query(updateSql, [commentData.feedback, patient_id]);

        if (updateResult.affectedRows === 0) {
            console.error("No record found for the given patient_id or no changes made:", patient_id);
            return new ApiResponse(404, "No diagnosis record found for the given patient_id.", null, null);
        }

        // Fetch the updated diagnosis record to return
        const [updatedDiagnosis] = await executePoolQuery(pool, `SELECT * FROM diagnosis WHERE patient_id = ? LIMIT 1`, [patient_id]);

        console.log("Doctor comment updated successfully for patient:", patient_id);

        return new ApiResponse(200, "Doctor comment updated successfully.", null, updatedDiagnosis[0]);
    } catch (error) {
        console.error("Error while updating doctor comment:", error.message);
        return new ApiResponse(500, "Exception while updating doctor comment.", null, error.message);
    }
}

module.exports = {
    addDiagnosis,
    updateDiagnosis,
    listDiagnosis,
    listAllDiagnosis,
    addDoctorComment,
};