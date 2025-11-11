const ApiResponse = require("../utils/api-response");
const otherTestsService = require("../service/otherTests-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getOtherTestsPool = (user) => {
    // Infer location from the authenticated user or default
    const location = user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          OTHER TESTS CONTROLLERS
// -------------------------------------------------------------------------

async function addOtherTests(req, res) {
    const pool = getOtherTestsPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;
        const otherTestsData = req.body;

        console.log("Controller received request to add other tests for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await otherTestsService.addOtherTests(
            pool,
            otherTestsData,
            patient_id,
        );
        console.log("Add other tests Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while adding other tests:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while adding other tests.", null, error.message));
    }
}

async function updateOtherTests(req, res) {
    const pool = getOtherTestsPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    const { patient_id } = req.params;
    const updatedOtherTestsData = req.body;

    try {
        console.log("Controller received request to update other tests for patient:", patient_id);
        
        // ✅ PASS THE POOL as the first argument
        const response = await otherTestsService.updateOtherTests(
            pool,
            patient_id,
            updatedOtherTestsData,
        );

        // Service returns an ApiResponse object, use its status code
        return res.status(response.statusCode).send(response);
    } catch (error) {
        console.error("Error in update other tests Controller:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while updating other tests.", null, error.message));
    }
}

async function listOtherTests(req, res) {
    const pool = getOtherTestsPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;

        console.log("Controller received request to list other tests for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await otherTestsService.listOtherTests(pool, patient_id);
        console.log("Get other tests data Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while fetching patient other tests data:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while fetching patient other tests data.", null, error.message));
    }
}

module.exports = {
    addOtherTests,
    updateOtherTests,
    listOtherTests,
};