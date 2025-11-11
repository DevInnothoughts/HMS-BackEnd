const ApiResponse = require('../utils/api-response');
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

// -------------------------------------------------------------------------
//                          CORE IVR OPERATIONS
// -------------------------------------------------------------------------

/**
 * 1. List IVR Data by Date Range (Converted to MySQL)
 */
async function listIvrdata(pool, filters) {
    try {
        const { from, to } = filters;
        console.log("Received dates:", from, to);

        let whereClauses = ["(is_deleted IS NULL OR is_deleted != 1)"];
        let params = [];
        
        // Convert dates to YYYY-MM-DD bounds for MySQL
        if (from) {
            const startDate = moment(from).format("YYYY-MM-DD 00:00:00");
            whereClauses.push("call_date >= ?");
            params.push(startDate);
        }

        if (to) {
            const endDate = moment(to).format("YYYY-MM-DD 23:59:59");
            whereClauses.push("call_date <= ?");
            params.push(endDate);
        }
        
        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const sql = `
            SELECT * FROM ivrdata
            ${whereString}
            ORDER BY ivr_id DESC;
        `;

        const ivrdata = await executePoolQuery(pool, sql, params);
        
        console.log("Fetched IVR records:", ivrdata.length);
        return ivrdata;
    } catch (error) {
        console.error("Error while listing IVR data:", error.message);
        throw new Error("Unable to fetch IVR data list.");
    }
}

/**
 * 2. Edit Note (Converted to MySQL)
 */
async function editNote(pool, ivr_id, data) {
    try {
        if (!ivr_id) {
            return { success: false, message: "Invalid IVR ID." };
        }

        let noteValue;
        // Extract note from data object
        if (typeof data === "object" && data !== null && typeof data.note === "string") {
            noteValue = data.note.trim();
        } else {
            return { success: false, message: "Note must be a valid string." };
        }
        
        // Check if record exists before updating (optional but good practice)
        const checkSql = `SELECT ivr_id FROM ivrdata WHERE ivr_id = ? LIMIT 1`;
        const existingRecord = await executePoolQuery(pool, checkSql, [ivr_id]);

        if (existingRecord.length === 0) {
             return { success: false, message: `No record found with IVR ID ${ivr_id}.` };
        }

        // Perform update in MySQL
        const updateSql = `
            UPDATE ivrdata
            SET note = ?
            WHERE ivr_id = ?
            LIMIT 1;
        `;

        const [updateResult] = await pool.query(updateSql, [noteValue, ivr_id]);

        if (updateResult.affectedRows === 0) {
            // This happens if the record exists but the note value was the same.
            console.warn(`IVR ID ${ivr_id} found but no changes were made.`);
        }

        // Return success and fetch the updated record (optional)
        const [updatedRecord] = await executePoolQuery(pool, checkSql, [ivr_id]);
        
        console.log("Note updated successfully for IVR ID:", ivr_id);
        
        return { 
            success: true, 
            data: updatedRecord[0], // Return the updated row
            message: "Note updated successfully."
        };

    } catch (error) {
        console.error("Error while updating note:", error.message);
        return { success: false, message: "Error updating note.", error: error.message };
    }
}


// -------------------------------------------------------------------------
//                          DROPDOWN FETCHERS
// -------------------------------------------------------------------------

/**
 * 3. Fetch Doctor Dropdown (Converted to MySQL)
 */
async function doctorDropdown(pool) {
    try {
        const sql = `
            SELECT doctor_id, name
            FROM doctor
            WHERE (is_deleted IS NULL OR is_deleted != 1)
            ORDER BY name ASC;
        `;
        return await executePoolQuery(pool, sql);
    } catch (error) {
        console.error("Error fetching doctor dropdown:", error.message);
        throw new Error("Unable to fetch doctor dropdown.");
    }
}

/**
 * 4. Fetch FDE Dropdown (Converted to MySQL)
 */
async function fdeDropdown(pool) {
    try {
        const sql = `
            SELECT FDEID, FDEName
            FROM fdedetails
            WHERE (is_deleted IS NULL OR is_deleted != 1)
            ORDER BY FDEName ASC;
        `;
        return await executePoolQuery(pool, sql);
    } catch (error) {
        console.error("Error fetching FDE dropdown:", error.message);
        throw new Error("Unable to fetch FDE dropdown.");
    }
}

/**
 * 5. Fetch Enquiry Dropdown (Converted to MySQL)
 */
async function enquiryDropdown(pool) {
    try {
        const sql = `
            SELECT enquiry_id, enquirytype
            FROM enquiry
            WHERE (is_deleted IS NULL OR is_deleted != 1)
            ORDER BY enquiry_id DESC;
        `;
        return await executePoolQuery(pool, sql);
    } catch (error) {
        console.error("Error fetching enquiry dropdown:", error.message);
        throw new Error("Unable to fetch enquiry dropdown.");
    }
}

module.exports = {
    listIvrdata,
    doctorDropdown,
    fdeDropdown,
    enquiryDropdown,
    editNote
};