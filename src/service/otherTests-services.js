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
 * 1. Add Other Tests Record (Converted to MySQL)
 */
async function addOtherTests(pool, otherTestsData, patient_id) {
    console.log("Service received request for patient ID:", patient_id);

    try {
        // 1. Check if a record already exists for this patient_id
        const checkSql = `SELECT patient_id FROM other_tests WHERE patient_id = ? LIMIT 1`;
        const existingTests = await executePoolQuery(pool, checkSql, [patient_id]);
        
        if (existingTests.length > 0) {
            return new ApiResponse(
                400,
                "Other tests record already exists for this patient. Use updateOtherTests.",
                null,
                null,
            );
        }

        // 2. Fetch test IDs for the provided comma-separated test names
        const testNames = otherTestsData.test_type
            .split(",")
            .map((name) => name.trim())
            .filter(name => name); // Filter out empty strings

        const testsSql = `SELECT test_id, test_name FROM lab_test WHERE test_name IN (?)`;
        const tests = await executePoolQuery(pool, testsSql, [testNames]);

        // Check if all test names were found
        const foundTestNames = tests.map((test) => test.test_name);
        const missingTests = testNames.filter(
            (name) => !foundTestNames.includes(name),
        );
        if (missingTests.length > 0) {
            return new ApiResponse(
                404,
                `Test with name(s) "${missingTests.join(", ")}" not found.`,
                null,
                null,
            );
        }

        // 3. Extract test IDs and store as comma-separated string
        const testIdsString = tests.map((test) => test.test_id).join(",");

        // 4. Fetch doctor_id for the ref_doctor name
        let refDoctorId = null;
        if (otherTestsData.ref_doctor) {
            const doctorSql = `SELECT doctor_id FROM doctor WHERE name = ? LIMIT 1`;
            const [doctor] = await executePoolQuery(pool, doctorSql, [otherTestsData.ref_doctor]);
            // NOTE: Original code commented out the 'not found' error, respecting that here.
            refDoctorId = doctor ? doctor.doctor_id : null;
        }

        // 5. Insert the new record
        const insertSql = `
            INSERT INTO other_tests (
                patient_id, test_date, test_type, ref_doctor, fee_status, visit_type, test_comment
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const insertParams = [
            patient_id,
            otherTestsData.test_date,
            testIdsString, // Store comma-separated IDs
            refDoctorId, // Store doctor_id
            otherTestsData.fee_status,
            otherTestsData.visit_type,
            otherTestsData.test_comment,
        ];

        const [otherTestsResult] = await pool.query(insertSql, insertParams);
        
        if (otherTestsResult.affectedRows === 0) {
             throw new Error("Failed to insert other tests record.");
        }
        
        console.log("Patient other tests successfully registered. Insert ID:", otherTestsResult.insertId);
        
        return new ApiResponse(
            201,
            "Patient other tests registered successfully.",
            null,
            { insertId: otherTestsResult.insertId },
        );
    } catch (error) {
        console.error("Error while registering patient other tests: ", error.message);
        return new ApiResponse(
            500,
            "Exception while registering patient other tests.",
            null,
            error.message,
        );
    }
}

/**
 * 2. Update Other Tests Record (Converted to MySQL)
 */
async function updateOtherTests(pool, patient_id, updatedOtherTestsData) {
    try {
        console.log("Service received request to update other tests for patient_id:", patient_id);

        // 1. Check if record exists
        const checkSql = `SELECT patient_id FROM other_tests WHERE patient_id = ? LIMIT 1`;
        const existingTests = await executePoolQuery(pool, checkSql, [patient_id]);

        if (existingTests.length === 0) {
            return new ApiResponse(
                400,
                "Patient other tests not found for update.",
                null,
                null,
            );
        }
        
        // 2. Prepare dynamic update query
        const updateFields = Object.keys(updatedOtherTestsData).filter(key => key !== 'patient_id');
        
        if (updateFields.length === 0) {
            return new ApiResponse(200, "No changes provided.", null, {});
        }

        const setClauses = updateFields.map(field => `${field} = ?`).join(', ');
        const updateValues = updateFields.map(field => updatedOtherTestsData[field]);
        updateValues.push(patient_id); 

        const updateSql = `
            UPDATE other_tests
            SET ${setClauses}
            WHERE patient_id = ?
            LIMIT 1;
        `;

        const [updateResult] = await pool.query(updateSql, updateValues);

        if (updateResult.affectedRows === 0) {
            // Note: This often means no new values were provided
            console.warn(`Other tests for patient ${patient_id} found but not updated.`);
        }

        // 3. Return success (refetching the single updated record)
        const [updatedOtherTests] = await executePoolQuery(pool, checkSql, [patient_id]);
        
        return new ApiResponse(200, "Other tests updated successfully.", null, {
            otherTests: updatedOtherTests[0],
        });

    } catch (error) {
        console.error("Error while updating other tests:", error.message);
        return new ApiResponse(
            500,
            "Exception while updating other tests.",
            null,
            error.message,
        );
    }
}

/**
 * 3. List Other Tests Record and Details (Converted to MySQL)
 */
async function listOtherTests(pool, patient_id) {
    console.log("Service received request to list other tests for patient_id:", patient_id);

    try {
        // 1. Fetch main other_tests record
        const otherTestsSql = `
            SELECT * FROM other_tests 
            WHERE patient_id = ? 
            AND (is_deleted IS NULL OR is_deleted != 1)
            LIMIT 1
        `;
        const [otherTests] = await executePoolQuery(pool, otherTestsSql, [patient_id]);

        if (!otherTests) {
            return new ApiResponse(404, "Patient other tests not found for the provided patient_id", null, null);
        }
        
        // 2. Enrich: Fetch doctor name
        let refDoctorName = null;
        if (otherTests.ref_doctor) {
             const doctorSql = `SELECT name FROM doctor WHERE doctor_id = ? LIMIT 1`;
             const [doctor] = await executePoolQuery(pool, doctorSql, [otherTests.ref_doctor]);
             refDoctorName = doctor ? doctor.name : null;
        }
        otherTests.ref_doctor = refDoctorName;

        // 3. Process test_type (comma-separated IDs)
        const testIdsString = otherTests.test_type;
        if (!testIdsString) {
             return new ApiResponse(404, "No test IDs found in test_type field", null, null);
        }
        
        // Safely split and convert IDs to numbers
        const testIds = testIdsString.split(',').map(id => Number(id)).filter(id => !isNaN(id));

        if (testIds.length === 0) {
             return new ApiResponse(400, "One or more test_ids are invalid and cannot be converted to numbers", null, null);
        }

        // 4. Fetch test details from lab_test
        const testDetailsSql = `
            SELECT test_name, test_code 
            FROM lab_test 
            WHERE test_id IN (?)
        `;
        const testDetails = await executePoolQuery(pool, testDetailsSql, [testIds]);

        console.log("Fetched test details:", testDetails);

        if (testDetails.length === 0) {
            return new ApiResponse(404, "No test details found for the provided test IDs", null, null);
        }

        const response = {
            patient_id: patient_id,
            otherTests: otherTests,
            testDetails: testDetails,
        };

        return new ApiResponse(200, "Other tests fetched successfully.", null, response);
    } catch (error) {
        console.error("Error while fetching patient other tests:", error.message);
        return new ApiResponse(500, "Exception while fetching patient other tests.", null, error.message);
    }
}

module.exports = {
  addOtherTests,
  updateOtherTests,
  listOtherTests,
};