const ApiResponse = require("../utils/api-response");
const followUpService = require("../service/followUp-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getFollowUpPool = (user) => {
    // Infer location from the authenticated user or default
    const location = user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance directly
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                         FOLLOW UP CONTROLLERS
// -------------------------------------------------------------------------

async function followUp(req, res, next) {
    const pool = getFollowUpPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;
        const combinedData = req.body;

        console.log("Controller received request to update follow-up for patient ID:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await followUpService.followUp(
            pool,
            patient_id,
            combinedData,
        );

        // Service returns an ApiResponse object
        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while updating patient follow-up:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while updating follow-up.",
                    null,
                    error.message,
                ),
            );
    }
}

async function listFollowUp(req, res) {
    const pool = getFollowUpPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;

        console.log(
            "Controller received request to list follow-up data for patient ID:",
            patient_id,
        );
        
        // ✅ PASS THE POOL as the first argument
        const result = await followUpService.listFollowUp(pool, patient_id);
        console.log("List follow-up Result:", result.data ? 'Success' : 'Failure'); // Log status

        // Service returns an ApiResponse object, use its status code
        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while fetching follow-up data:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while fetching follow-up.",
                    null,
                    error.message,
                ),
            );
    }
}

module.exports = {
    followUp,
    listFollowUp,
};