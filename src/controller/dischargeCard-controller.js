const ApiResponse = require("../utils/api-response");
const dischargeCardService = require("../service/dischargeCard-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getDischargeCardPool = (user) => {
    // Infer location from the authenticated user or default
    const location = user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance directly
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                         DISCHARGE CARD CONTROLLERS
// -------------------------------------------------------------------------

async function addDischargeCard(req, res) {
    const pool = getDischargeCardPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;
        const dischargeCardData = req.body;

        console.log("Controller received request to add Discharge Card for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await dischargeCardService.addDischargeCard(
            pool,
            dischargeCardData,
            patient_id,
        );
        console.log("Add dischargeCardData Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while adding dischargeCardData:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while adding dischargeCardData.",
                    null,
                    error.message,
                ),
            );
    }
}

async function updateDischargeCard(req, res) {
    const pool = getDischargeCardPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    const { patient_id } = req.params;
    const updatedDischargeCardData = req.body;

    try {
        console.log("Controller received request to update Discharge Card for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const response = await dischargeCardService.updateDischargeCard(
            pool,
            patient_id,
            updatedDischargeCardData,
        );

        // Service returns an ApiResponse object, check status code for consistent handling
        return res.status(response.statusCode).send(response); 
    } catch (error) {
        console.error("Error in update discharge card Controller:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while updating discharge card.",
                    null,
                    error.message,
                ),
            );
    }
}

async function listDischargeCard(req, res) {
    const pool = getDischargeCardPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;

        console.log(
            "Controller received request to list discharge card data for patient_id:",
            patient_id,
        );

        // ✅ PASS THE POOL as the first argument
        const result = await dischargeCardService.listDischargeCard(pool, patient_id);
        console.log("Get discharge card data Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error(
            "Error while fetching patient discharge card data:",
            error.message,
        );
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while fetching patient discharge card data.",
                    null,
                    error.message,
                ),
            );
    }
}

module.exports = {
    addDischargeCard,
    updateDischargeCard,
    listDischargeCard,
};