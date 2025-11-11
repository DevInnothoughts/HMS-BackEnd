const ApiResponse = require('../utils/api-response');
const IvrdataService = require('../service/ivrdata-service');
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getIvrPool = (req) => {
    // Location can be passed via query, body, or user object. Prioritize query/user.
    const location = req.query?.location || req.user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          CORE IVR CONTROLLERS
// -------------------------------------------------------------------------

async function listIvrdata(req, res, next) {
    const pool = getIvrPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        console.log("Controller received request to list all IVR data with query params:", req.query);

        // ✅ PASS THE POOL as the first argument
        const ivrdata = await IvrdataService.listIvrdata(pool, req.query);
        console.log("List IVR data Result: Found", ivrdata.length, "records.");

        // Service returns raw data array, wrap it in ApiResponse here
        return res.status(200).send(new ApiResponse(200, "IVR data list fetched successfully.", null, ivrdata));
    } catch (error) {
        console.error("Error while fetching IVR data:", error.message);
        return res.status(500).send(new ApiResponse(500, "Error while fetching IVR data.", null, error.message));
    }
}

async function editNote(req, res, next) {
    const pool = getIvrPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const ivr_id = req.params.ivr_id;
        const note = req.body; // Expecting { note: "New text" }

        console.log("Controller received request to edit note for IVR ID:", ivr_id);

        // ✅ PASS THE POOL as the first argument
        const updatedNote = await IvrdataService.editNote(pool, ivr_id, note);

        if (!updatedNote.success) {
            const statusCode = updatedNote.message.includes("No record found") ? 404 : 400;
            return res.status(statusCode).send(new ApiResponse(statusCode, updatedNote.message, null, updatedNote.error));
        }
        
        // Service returns { success: true, data: row }
        return res.status(200).send(new ApiResponse(200, "Note updated successfully.", null, updatedNote.data));
    } catch (error) {
        console.error("Error while updating note:", error.message);
        return res.status(500).send(new ApiResponse(500, "Error while updating note.", null, error.message));
    }
}

// -------------------------------------------------------------------------
//                         DROPDOWN CONTROLLERS
// -------------------------------------------------------------------------

async function doctorDropdown(req, res, next) {
    const pool = getIvrPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        console.log("Controller received request to fetch doctor dropdown");
        
        // ✅ PASS THE POOL as the first argument
        const data = await IvrdataService.doctorDropdown(pool);

        if (data.length === 0) {
            return res.status(404).send(new ApiResponse(404, "No doctor data found.", null, []));
        }

        // Service returns raw data array, wrap it in ApiResponse here
        return res.status(200).send(new ApiResponse(200, "Doctor dropdown fetched successfully.", null, data));
    } catch (error) {
        console.error("Error while fetching doctor dropdown:", error.message);
        return res.status(500).send(new ApiResponse(500, "Error while fetching doctor dropdown.", null, error.message));
    }
}

async function fdeDropdown(req, res, next) {
    const pool = getIvrPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        console.log("Controller received request to fetch FDE dropdown");
        
        // ✅ PASS THE POOL as the first argument
        const data = await IvrdataService.fdeDropdown(pool);

        if (data.length === 0) {
            return res.status(404).send(new ApiResponse(404, "No FDE data found.", null, []));
        }

        // Service returns raw data array, wrap it in ApiResponse here
        return res.status(200).send(new ApiResponse(200, "FDE dropdown fetched successfully.", null, data));
    } catch (error) {
        console.error("Error while fetching FDE dropdown:", error.message);
        return res.status(500).send(new ApiResponse(500, "Error while fetching FDE dropdown.", null, error.message));
    }
}

async function enquiryDropdown(req, res, next) {
    const pool = getIvrPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        console.log("Controller received request to fetch enquiry dropdown");
        
        // ✅ PASS THE POOL as the first argument
        const data = await IvrdataService.enquiryDropdown(pool);

        if (data.length === 0) {
            return res.status(404).send(new ApiResponse(404, "No enquiry data found.", null, []));
        }

        // Service returns raw data array, wrap it in ApiResponse here
        return res.status(200).send(new ApiResponse(200, "Enquiry dropdown fetched successfully.", null, data));
    } catch (error) {
        console.error("Error while fetching enquiry dropdown:", error.message);
        return res.status(500).send(new ApiResponse(500, "Error while fetching enquiry dropdown.", null, error.message));
    }
}

module.exports = {
    listIvrdata,
    doctorDropdown,
    fdeDropdown,
    enquiryDropdown,
    editNote
};