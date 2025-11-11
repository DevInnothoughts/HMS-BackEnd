const ApiResponse = require("../utils/api-response");
const patienttabsService = require("../service/patienttabs-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getPatientTabsPool = (req) => {
    // Infer location from the authenticated user or default
    const location = req.query?.location || req.user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                         PATIENT TABS CONTROLLERS (PERSONAL)
// -------------------------------------------------------------------------

async function personal(req, res, next) {
    const pool = getPatientTabsPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const patient_id = req.params.patient_id;
        console.log("Controller received request for patient ID:", patient_id);
        
        // ✅ PASS THE POOL as the first argument
        const result = await patienttabsService.personal(pool, patient_id);
        
        console.log("Controller Result:", result);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error while listing personal details:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while listing personal details.",
                    null,
                    error.message,
                ),
            );
    }
}

async function editPersonal(req, res, next) {
    const pool = getPatientTabsPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const patient_id = req.params.patient_id;
        const updatedData = req.body;

        console.log("Controller received request to edit personal details for patient ID:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await patienttabsService.editPersonal(
            pool,
            patient_id,
            updatedData,
        );

        // Service returns an ApiResponse object, use its status code
        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while updating patient personal details:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while updating patient.",
                    null,
                    error.message,
                ),
            );
    }
}

module.exports = {
    personal,
    editPersonal,
};