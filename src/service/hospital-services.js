const ApiResponse = require("../utils/api-response");
const USER_ROLE = require("../constants/role-constant");
// Removed MongoDB/Mongoose imports

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
 * 1. Add a new hospital (Converted to MySQL)
 */
async function addHospital(pool, hospital, user) {
  console.log("Service received request ", hospital);

  try {
    // 1. Check if a hospital with the same Name and Location already exists
    const checkSql = `
      SELECT hospital_id FROM hospital 
      WHERE Name = ? AND Location = ? AND (is_deleted IS NULL OR is_deleted != 1) 
      LIMIT 1
    `;
    const existingHospital = await executePoolQuery(pool, checkSql, [hospital.Name, hospital.Location]);
    
    if (existingHospital.length > 0) {
      return new ApiResponse(
        400,
        "Hospital already exists for the provided hospital name at this location",
        null,
        null,
      );
    }

    // 2. Insert a new hospital record
    const insertSql = `
      INSERT INTO hospital (Name, Location) 
      VALUES (?, ?)
    `;

    const params = [hospital.Name, hospital.Location];

    const [result] = await pool.query(insertSql, params);
    
    if (result.affectedRows === 0) {
        throw new Error("Failed to insert hospital record.");
    }

    console.log("Hospital successfully registered. Insert ID:", result.insertId);
    
    return new ApiResponse(
      201,
      "Hospital registered successfully.",
      null,
      { insertId: result.insertId, Name: hospital.Name, Location: hospital.Location },
    );
  } catch (error) {
    console.error("Error while registering hospital: ", error.message);
    return new ApiResponse(
      500,
      "Exception while hospital registration.",
      null,
      error.message,
    );
  }
}

/**
 * 2. List all active hospitals (Converted to MySQL)
 */
async function listHospital(pool) {
  try {
    const sql = `
        SELECT hospital_id, Name, Location
        FROM hospital
        WHERE (is_deleted IS NULL OR is_deleted != 1)
        ORDER BY Name ASC;
    `;
    
    const hospitalList = await executePoolQuery(pool, sql);
    
    return hospitalList;
  } catch (error) {
    console.error("Error while fetching hospitals: ", error.message);
    // Throw a generic error for the controller to catch and format as an ApiResponse
    throw new Error("Unable to fetch hospitals.");
  }
}

module.exports = { addHospital, listHospital };