const ApiResponse = require("../utils/api-response");
const USER_ROLE = require("../constants/role-constant");
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
 * Add a new receptionist (Converted to MySQL)
 */
async function addReceptionist(pool, receptionist, user) {
  console.log("Service received request ", receptionist);

  try {
    // 1. Check if receptionist with the given Email already exists
    const checkSql = `SELECT receptionist_id FROM receptionist WHERE Email = ? LIMIT 1`;
    const existingReceptionist = await executePoolQuery(pool, checkSql, [receptionist.Email]);
    
    if (existingReceptionist.length > 0) {
      return new ApiResponse(
        400,
        "Receptionist is already registered with the provided email",
        null,
        null,
      );
    }

    // 2. Create a new receptionist instance
    const insertSql = `
      INSERT INTO receptionist (
        Name, Location, Email, Password, Address, Phone
      ) VALUES (
        ?, ?, ?, ?, ?, ?
      )
    `;

    const params = [
      receptionist.Name,
      receptionist.Location,
      receptionist.Email,
      receptionist.Password,
      receptionist.Address,
      receptionist.Phone,
    ];

    const [result] = await pool.query(insertSql, params);
    
    if (result.affectedRows === 0) {
        throw new Error("Failed to insert receptionist record.");
    }

    console.log("Receptionist successfully registered. Insert ID:", result.insertId);
    
    // Return a response that includes the created data's identifier
    return new ApiResponse(
      201,
      "Receptionist registered successfully.",
      null,
      { insertId: result.insertId, Email: receptionist.Email }
    );
  } catch (error) {
    console.error("Error while registering receptionist: ", error.message);
    return new ApiResponse(
      500,
      "Exception while receptionist registration.",
      null,
      error.message,
    );
  }
}

module.exports = { addReceptionist };