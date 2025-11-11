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

/**
 * Helper function to fetch doctor name by doctor_id
 */
async function getDoctorName(pool, doctorId) {
    if (!doctorId) return null;
    const [doctor] = await executePoolQuery(pool, `SELECT name FROM doctor WHERE doctor_id = ? LIMIT 1`, [doctorId]);
    return doctor ? doctor.name : null;
}

/**
 * Helper function to fetch doctor ID by name
 */
async function getDoctorIdByName(pool, name) {
    if (!name) return null;
    const [doctor] = await executePoolQuery(pool, `SELECT doctor_id FROM doctor WHERE name = ? LIMIT 1`, [name]);
    return doctor ? doctor.doctor_id : null;
}

// -------------------------------------------------------------------------
//                          CORE SURGERY OPERATIONS
// -------------------------------------------------------------------------

/**
 * 1. Add Surgery Details (Converted to MySQL)
 */
async function addSurgeryDetails(pool, surgeryDetailsData, patient_id) {
    console.log("Service received request for patient ID:", patient_id);

    try {
        // 1. Check if record already exists
        const checkSql = `SELECT patient_id FROM surgery_details WHERE patient_id = ? LIMIT 1`;
        const existingDetails = await executePoolQuery(pool, checkSql, [patient_id]);
        
        if (existingDetails.length > 0) {
            return new ApiResponse(
                400,
                "Surgery details already exist for this patient.",
                null,
                null,
            );
        }

        // 2. Fetch assistanceDoctor ID
        const assistanceDoctorId = await getDoctorIdByName(pool, surgeryDetailsData.assistanceDoctor);

        if (!assistanceDoctorId && surgeryDetailsData.assistanceDoctor) {
            return new ApiResponse(404, `Assistance Doctor with name ${surgeryDetailsData.assistanceDoctor} not found`, null, null);
        }
        
        // 3. Insert new surgery details
        const insertSql = `
            INSERT INTO surgery_details (
                patient_id, plan, admission_date, surgery_date, risk_consent, anesthesia, 
                additional_comment, assistanceDoctor, anaesthetist, surgery_remarks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            patient_id,
            surgeryDetailsData.plan,
            surgeryDetailsData.admission_date,
            surgeryDetailsData.surgery_date,
            surgeryDetailsData.risk_consent,
            surgeryDetailsData.anesthesia,
            surgeryDetailsData.additional_comment,
            assistanceDoctorId, // Store ID
            surgeryDetailsData.anaesthetist,
            surgeryDetailsData.surgery_remarks,
        ];

        const [surgeryDetailsResult] = await pool.query(insertSql, params);
        
        if (surgeryDetailsResult.affectedRows === 0) {
            throw new Error("Failed to insert surgery details record.");
        }

        console.log("Patient surgeryDetails successfully registered. Insert ID:", surgeryDetailsResult.insertId);

        return new ApiResponse(
            201,
            "Surgery details history registered successfully.",
            null,
            { insertId: surgeryDetailsResult.insertId },
        );
    } catch (error) {
        console.error("Error while registering surgery details: ", error.message);
        return new ApiResponse(
            500,
            "Exception while registering surgery details.",
            null,
            error.message,
        );
    }
}

/**
 * 2. Update Surgery Details (Converted to MySQL)
 */
async function updateSurgeryDetails(pool, patient_id, updatedSurgeryDetailsData) {
    try {
        console.log("Service received request to update surgeryDetails for patient_id:", patient_id);

        // 1. Check existence
        const checkSql = `SELECT * FROM surgery_details WHERE patient_id = ? LIMIT 1`;
        let [surgeryDetailsData] = await executePoolQuery(pool, checkSql, [patient_id]);

        if (!surgeryDetailsData) {
            return new ApiResponse(400, "Patient surgeryDetails not found for update", null, null);
        }

        // 2. Fetch/Update assistanceDoctor ID if name is provided
        let assistanceDoctorId = surgeryDetailsData.assistanceDoctor;
        if (updatedSurgeryDetailsData.assistanceDoctor) {
            const doctor = await getDoctorIdByName(pool, updatedSurgeryDetailsData.assistanceDoctor);

            if (!doctor) {
                return new ApiResponse(404, `Doctor with name ${updatedSurgeryDetailsData.assistanceDoctor} not found`, null, null);
            }
            assistanceDoctorId = doctor;
        }
        
        // Ensure ID is included in the payload for dynamic update
        updatedSurgeryDetailsData.assistanceDoctor = assistanceDoctorId;


        // 3. Prepare dynamic update query
        const updateFields = Object.keys(updatedSurgeryDetailsData).filter(key => key !== 'patient_id');
        
        if (updateFields.length === 0) {
             return new ApiResponse(200, "No changes provided.", null, surgeryDetailsData);
        }

        const setClauses = updateFields.map(field => `${field} = ?`).join(', ');
        const updateValues = updateFields.map(field => updatedSurgeryDetailsData[field]);
        updateValues.push(patient_id); 

        const updateSql = `UPDATE surgery_details SET ${setClauses} WHERE patient_id = ? LIMIT 1`;
        const [updateResult] = await pool.query(updateSql, updateValues);

        if (updateResult.affectedRows === 0) {
             console.warn(`Surgery details for patient ${patient_id} found but not updated.`);
        }

        // 4. Fetch the updated record
        const [updatedSurgeryDetails] = await executePoolQuery(pool, checkSql, [patient_id]);

        return new ApiResponse(200, "surgeryDetails updated successfully.", null, {
            surgeryDetails: updatedSurgeryDetails,
        });
    } catch (error) {
        console.error("Error while updating surgeryDetails:", error.message);
        return new ApiResponse(500, "Exception while updating surgeryDetails.", null, error.message);
    }
}

/**
 * 3. List Surgery Details for one patient (Converted to MySQL)
 */
async function listSurgeryDetails(pool, patient_id) {
    try {
        // 1. Fetch main surgery details record
        const detailsSql = `SELECT * FROM surgery_details WHERE patient_id = ? LIMIT 1`;
        const [surgeryDetails] = await executePoolQuery(pool, detailsSql, [patient_id]);

        if (!surgeryDetails) {
            return new ApiResponse(404, "Patient surgeryDetails not found for the provided patient_id", null, null);
        }

        // 2. Enrich: Fetch doctor name
        if (surgeryDetails.assistanceDoctor) {
            surgeryDetails.assistanceDoctor = await getDoctorName(pool, surgeryDetails.assistanceDoctor);
        }
        
        console.log("Fetched patient surgeryDetails:", surgeryDetails);

        return new ApiResponse(200, "Patient surgeryDetails fetched successfully.", null, { surgeryDetails });
    } catch (error) {
        console.error("Error while fetching patient surgeryDetails:", error.message);
        return new ApiResponse(500, "Exception while fetching patient surgeryDetails.", null, error.message);
    }
}

/**
 * 4. List All Surgery Details (Converted to MySQL)
 */
async function listAllSurgeryDetails(pool) {
    console.log("Service received request to list surgeries for all patients.");

    try {
        // 1. Fetch main surgery data with patient and doctor details using JOINs
        const mainQuerySql = `
            SELECT 
                sd.patient_id, sd.admission_date, sd.surgery_date, sd.plan, sd.opd_feedback,
                p.prefix, p.name, p.age, p.sex, p.phone, p.mobile_2, p.ref, p.occupation, p.address,
                d.name AS assistanceDoctorName
            FROM surgery_details sd
            JOIN patient p ON sd.patient_id = p.patient_id
            LEFT JOIN doctor d ON sd.assistanceDoctor = d.doctor_id
            WHERE sd.consent = 'Yes' -- Assuming 'consent' column exists
            AND (sd.is_deleted IS NULL OR sd.is_deleted != 1)
            LIMIT 500
        `;
        
        const surgeries = await executePoolQuery(pool, mainQuerySql);

        if (surgeries.length === 0) {
            return new ApiResponse(404, "No surgery data found.", null, null);
        }
        
        // 2. Format dates and structure results
        const results = surgeries.map(surgery => ({
            patient_id: surgery.patient_id,
            admission_date: moment(surgery.admission_date).format("DD/MM/YYYY"),
            surgery_date: moment(surgery.surgery_date).format("DD/MM/YYYY"),
            plan: surgery.plan,
            opd_feedback: surgery.opd_feedback,
            assistanceDoctor: surgery.assistanceDoctorName || null,
            
            patientDetail: {
                prefix: surgery.prefix,
                name: surgery.name,
                age: surgery.age,
                sex: surgery.sex,
                phone: surgery.phone,
                mobile_2: surgery.mobile_2,
                ref: surgery.ref,
                occupation: surgery.occupation,
                address: surgery.address,
            },
        }));

        console.log("Fetched surgeries with patient details:", results.length);

        return new ApiResponse(200, "Surgeries fetched successfully.", null, results);
    } catch (error) {
        console.error("Error while fetching surgeries:", error.message);
        return new ApiResponse(500, "Exception while fetching surgeries.", null, error.message);
    }
}

/**
 * 5. Add/Update Patient Comment (Converted to MySQL)
 */
async function addPatientComment(pool, patient_id, commentData) {
    console.log("Service received request to update patient comment for patient_id:", patient_id);

    try {
        // Update the opd_feedback field in surgery_details
        const updateSql = `
            UPDATE surgery_details
            SET opd_feedback = ?
            WHERE patient_id = ?
            LIMIT 1;
        `;
        
        const [updateResult] = await pool.query(updateSql, [commentData.opd_feedback, patient_id]);

        if (updateResult.affectedRows === 0) {
            return new ApiResponse(404, "No surgery record found for the given patient_id.", null, null);
        }

        // Fetch the updated record
        const [updatedSurgery] = await executePoolQuery(pool, `SELECT * FROM surgery_details WHERE patient_id = ? LIMIT 1`, [patient_id]);

        console.log("Patient comment updated successfully.");

        return new ApiResponse(200, "Patient comment updated successfully.", null, updatedSurgery[0]);
    } catch (error) {
        console.error("Error while updating patient comment:", error.message);
        return new ApiResponse(500, "Exception while updating patient comment.", null, error.message);
    }
}

module.exports = {
  addSurgeryDetails,
  updateSurgeryDetails,
  listSurgeryDetails,
  listAllSurgeryDetails,
  addPatientComment,
};