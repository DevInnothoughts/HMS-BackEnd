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
    // pool.query returns a promise resolving to [rows, fields]
    const [rows] = await pool.query(sql, params);
    return rows;
}

/**
 * Add a new consultation (Converted to MySQL)
 */
async function addConsultation(pool, consultation, user) {
  console.log("Service received request ", consultation);

  try {
    // 1. Check if Consultation with the given name already exists
    const checkSql = `SELECT consultation_id FROM consultation WHERE consultation_name = ? AND (is_deleted IS NULL OR is_deleted != 1) LIMIT 1`;
    const existingConsultations = await executePoolQuery(pool, checkSql, [consultation.consultation_name]);
    
    if (existingConsultations.length > 0) {
      return new ApiResponse(
        400,
        "Consultation is already registered with the provided name.",
        null,
        null,
      );
    }

    // 2. Insert a new consultation instance
    // Note: If consultation_id is auto-incremented in MySQL, you can omit it here.
    // Assuming you manually generate or provide consultation_id based on the original code.
    const insertSql = `
      INSERT INTO consultation (
        consultation_id, consultation_name
      ) VALUES (?, ?)
    `;

    const params = [
      consultation.consultation_id,
      consultation.consultation_name,
    ];

    const [result] = await pool.query(insertSql, params);
    
    if (result.affectedRows === 0) {
        throw new Error("Failed to insert consultation record.");
    }

    console.log("Consultation successfully registered. Insert ID:", result.insertId);
    
    // Return a new object that includes the generated/provided ID
    const newConsultationData = {
        insertId: result.insertId,
        consultation_id: consultation.consultation_id,
        consultation_name: consultation.consultation_name
    };
    
    return new ApiResponse(
      201,
      "Consultation registered successfully.",
      null,
      newConsultationData,
    );
  } catch (error) {
    console.error("Error while registering Consultation: ", error.message);
    return new ApiResponse(
      500,
      "Exception while Consultation registration.",
      null,
      error.message,
    );
  }
}

module.exports = { addConsultation };