const ApiResponse = require("../utils/api-response");
const surgeryDetailsService = require("../service/surgeryDetails-services");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getSurgeryPool = (req) => {
    // Infer location from query params, body, or user object
    const location = req.query?.location || req.user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          SURGERY DETAILS CONTROLLERS
// -------------------------------------------------------------------------

async function addSurgeryDetails(req, res) {
    const pool = getSurgeryPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;
        const surgeryDetailsData = req.body;

        console.log("Controller received request to add surgeryDetails Card for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await surgeryDetailsService.addSurgeryDetails(
            pool,
            surgeryDetailsData,
            patient_id,
        );
        console.log("Add surgeryDetails Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while adding surgeryDetails:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while adding surgeryDetails.",
                    null,
                    error.message,
                ),
            );
    }
}

async function updateSurgeryDetails(req, res) {
    const pool = getSurgeryPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    const { patient_id } = req.params;
    const updatedSurgeryDetailsData = req.body;

    try {
        console.log("Controller received request to update surgeryDetails for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const response = await surgeryDetailsService.updateSurgeryDetails(
            pool,
            patient_id,
            updatedSurgeryDetailsData,
        );

        // Service returns an ApiResponse object, use its status code
        return res.status(response.statusCode).send(response);
    } catch (error) {
        console.error("Error in update surgeryDetails card Controller:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while updating surgeryDetails card.",
                    null,
                    error.message,
                ),
            );
    }
}

async function listSurgeryDetails(req, res) {
    const pool = getSurgeryPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }
    
    try {
        const { patient_id } = req.params;

        console.log("Controller received request to list surgeryDetails for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await surgeryDetailsService.listSurgeryDetails(pool, patient_id);
        console.log("Get surgeryDetails Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while fetching patient surgeryDetails:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while fetching patient surgeryDetails.",
                    null,
                    error.message,
                ),
            );
    }
}

async function listAllSurgeryDetails(req, res) {
    const pool = getSurgeryPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        console.log("Received request to list all surgery.");

        // ✅ PASS THE POOL as the first argument
        const response = await surgeryDetailsService.listAllSurgeryDetails(pool); // Call the service function

        // Service returns an ApiResponse object
        return res.status(response.statusCode).json(response);
    } catch (error) {
        console.error("Error in surgery controller:", error.message);
        // Catch raw errors thrown by the service and format them
        return res.status(500).json(new ApiResponse(500, "Internal Server Error", null, error.message));
    }
}

async function addPatientComment(req, res) {
    const pool = getSurgeryPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;
        const commentData = req.body;
        console.log("Controller received request to add comment for patient:", patient_id);

        if (!patient_id) {
            return res.status(400).send(new ApiResponse(400, "Invalid or missing patient_id.", null, null));
        }

        // ✅ PASS THE POOL as the first argument
        const response = await surgeryDetailsService.addPatientComment(
            pool,
            patient_id,
            commentData,
        );

        return res.status(response.statusCode).send(response);
    } catch (error) {
        console.error("Error in addDoctorComment:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while adding comment.",
                    null,
                    error.message,
                ),
            );
    }
}

module.exports = {
  addSurgeryDetails,
  updateSurgeryDetails,
  listSurgeryDetails,
  listAllSurgeryDetails,
  addPatientComment,
};