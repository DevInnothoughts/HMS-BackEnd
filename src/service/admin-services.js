const ApiResponse = require("../utils/api-response");
const USER_ROLE = require("../constants/role-constant");
// Removed MongoDB/Mongoose imports

/**
 * Helper function to execute a MySQL query directly on the pool.
 * Note: This format assumes the connection pool is passed to the function.
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

/**
 * Add a new doctor (Converted to MySQL)
 */
async function addDoctor(pool, doctor, user) {
  console.log("Service received request ", doctor);

  try {
    // 1. Check if doctor with the given mobile number already exists
    const checkSql = `SELECT doctor_id FROM doctor WHERE phone = ? LIMIT 1`;
    const existingDoctors = await executePoolQuery(pool, checkSql, [doctor.phone]);
    
    if (existingDoctors.length > 0) {
      return new ApiResponse(
        400,
        "Doctor is already registered with the provided phone number.",
        null,
        null,
      );
    }

    // 2. Insert a new doctor
    const insertSql = `
      INSERT INTO doctor (
        gender, age, doctor_id, name, doctor_type, email, password, 
        address, job_location, phone, department_id, profile, is_deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Ensure values are prepared as strings/numbers for MySQL
    const params = [
      doctor.gender,
      doctor.age,
      doctor.doctor_id,
      doctor.name,
      doctor.doctor_type,
      doctor.email,
      doctor.password,
      doctor.address,
      doctor.jobLocation, // Assumed jobLocation maps to job_location
      doctor.phone,
      doctor.department_id,
      doctor.profile,
      doctor.is_deleted || 0, // Default to 0 if not provided
    ];

    const [result] = await pool.query(insertSql, params);
    
    if (result.affectedRows === 0) {
        throw new Error("Failed to insert doctor record.");
    }

    console.log("Doctor successfully registered. Insert ID:", result.insertId);
    
    return new ApiResponse(
      201,
      "Doctor registered successfully.",
      null,
      { insertId: result.insertId, doctor_id: doctor.doctor_id }
    );

  } catch (error) {
    console.error("Error while registering doctor: ", error.message);
    return new ApiResponse(
      500,
      "Exception while doctor registration.",
      null,
      error.message,
    );
  }
}

/**
 * Edit doctor details based on email (Converted to MySQL)
 */
async function editDoctor(pool, email, payload, user) {
  try {
    // 1. Find the doctor using email
    const findSql = `SELECT doctor_id, email FROM doctor WHERE email = ? AND (is_deleted IS NULL OR is_deleted != 1) LIMIT 1`;
    const doctors = await executePoolQuery(pool, findSql, [email]);
    
    if (doctors.length === 0) {
      return new ApiResponse(400, "Doctor not found for edit", null, null);
    }
    
    const doctor = doctors[0];

    // 2. Prepare dynamic update query
    const updateFields = Object.keys(payload).filter(key => 
        // Exclude identifiers and internal fields if necessary
        key !== 'email' && key !== 'doctor_id' && key !== '_id'
    );

    if (updateFields.length === 0) {
        return new ApiResponse(200, "No changes provided.", null, payload);
    }

    const setClauses = updateFields.map(field => {
        // Map jobLocation to job_location column if present
        const columnName = (field === 'jobLocation') ? 'job_location' : field;
        return `${columnName} = ?`;
    }).join(', ');
    
    const updateValues = updateFields.map(field => payload[field]);
    updateValues.push(email); // For WHERE clause

    const updateSql = `
        UPDATE doctor 
        SET ${setClauses} 
        WHERE email = ?
        LIMIT 1;
    `;

    const [updateResult] = await pool.query(updateSql, updateValues);
    
    if (updateResult.affectedRows === 0) {
        // This might happen if the record was found but no data changed.
        console.warn(`Doctor ${email} found but not updated. Might be no changes.`);
    }

    // Return the updated payload (or fetch the record if strict return is needed)
    return new ApiResponse(200, "Doctor Updated Successfully.", null, payload);
  } catch (error) {
    console.error("Error while updating doctor: ", error.message);
    return new ApiResponse(
      500,
      "Exception while updating doctor details.",
      null,
      error.message,
    );
  }
}

/**
 * List all active doctors (Converted to MySQL)
 */
async function listDoctor(pool, date) {
  try {
    // NOTE: The original MongoDB query used `{ Date: date }` which implies filtering by a 'Date' field.
    // However, listing all doctors is more common, so filtering by 'is_deleted' is standard.
    // If you need the 'Date' filter, adjust the SQL accordingly.
    
    const sql = `
        SELECT doctor_id, name, doctor_type, email, phone, job_location, department_id, profile
        FROM doctor
        WHERE (is_deleted IS NULL OR is_deleted != 1)
        LIMIT 500;
    `;
    // If 'date' field is actually a filter:
    // WHERE DATE(date_column) = ? AND (is_deleted IS NULL OR is_deleted != 1)

    const doctors = await executePoolQuery(pool, sql);
    
    return doctors;
  } catch (error) {
    console.error("Error while fetching doctors: ", error.message);
    // Throw a generic error for the controller to catch and format as an ApiResponse
    throw new Error("Unable to fetch doctors."); 
  }
}

module.exports = { addDoctor, editDoctor, listDoctor };