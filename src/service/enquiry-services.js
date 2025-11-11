const ApiResponse = require('../utils/api-response');
const moment = require("moment");
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
 * 1. Add a new enquiry (Converted to MySQL)
 */
async function addEnquiry(pool, enquiry) {
  console.log("Service received request to add enquiry:", enquiry);

  try {
    // 1. Format date to MySQL compatible format (YYYY-MM-DD HH:mm:ss)
    const formattedDateTime = moment(enquiry.date).format("YYYY-MM-DD HH:mm:ss");

    const sql = `
      INSERT INTO enquiry (
        date, doctorId, enquirytype, patient_name, patient_phone,
        patient_location, reference, FDE_Name, note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const params = [
      formattedDateTime,
      enquiry.doctorId,
      enquiry.enquirytype,
      enquiry.patient_name,
      enquiry.patient_phone,
      enquiry.patient_location,
      enquiry.reference,
      enquiry.FDE_Name,
      enquiry.note,
    ];

    const [result] = await pool.query(sql, params);
    
    if (result.affectedRows === 0) {
        throw new Error("Failed to insert enquiry record.");
    }

    console.log("Enquiry successfully saved. Insert ID:", result.insertId);

    return new ApiResponse(201, "Enquiry added successfully.", null, { insertId: result.insertId });
  } catch (error) {
    console.error("Error saving enquiry:", error.message);
    return new ApiResponse(500, "Error saving enquiry.", null, error.message);
  }
}

/**
 * 2. List enquiries by date range (Converted to MySQL)
 */
async function listEnquiry(pool, queryParams) {
  try {
    // 1. Convert DD-MM-YYYY strings to YYYY-MM-DD bounds for MySQL comparison
    const fromDate = moment(queryParams.from, "DD-MM-YYYY").startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const toDate = moment(queryParams.to, "DD-MM-YYYY").endOf("day").format("YYYY-MM-DD HH:mm:ss");

    console.log("Converted Date Range (MySQL):", fromDate, toDate);

    // 2. Define the SQL query with necessary joins
    const sql = `
        SELECT 
            e.*,
            d.name AS doctorName,
            f.FDEName AS FDE_Name_Full -- Assuming FDE name needs lookup if FDE_Name in enquiry is just an ID
        FROM enquiry e
        LEFT JOIN doctor d ON e.doctorId = d.doctor_id
        LEFT JOIN fdedetails f ON e.FDE_Name = f.FDEID -- Adjust if FDE_Name in enquiry is text, not an ID
        WHERE 
            e.date BETWEEN ? AND ?
            AND (e.is_deleted IS NULL OR e.is_deleted != 1)
        ORDER BY e.date DESC;
    `;

    const params = [fromDate, toDate];

    // 3. Execute query
    const enquiries = await executePoolQuery(pool, sql, params);
    
    console.log("Enquiry Results Found:", enquiries.length);

    return enquiries;
  } catch (error) {
    console.error("Error while fetching enquiries:", error.message);
    // Propagate error up for controller to handle ApiResponse conversion
    throw new Error("Unable to fetch enquiries: " + error.message);
  }
}

/**
 * 3. Function to fetch doctor dropdown data (Converted to MySQL)
 */
async function doctorDropdown(pool) {
  try {
      const sql = `
        SELECT doctor_id, name
        FROM doctor
        WHERE (is_deleted IS NULL OR is_deleted != 1)
        ORDER BY name ASC;
      `;
      const doctors = await executePoolQuery(pool, sql);
      
      console.log(`Retrieved ${doctors.length} doctors for dropdown.`);
      return doctors;
  } catch (error) {
      console.error("Error in service layer while fetching doctor dropdown:", error.message);
      throw new Error("Unable to fetch doctor dropdown.");
  }
}

module.exports = { addEnquiry, listEnquiry, doctorDropdown };