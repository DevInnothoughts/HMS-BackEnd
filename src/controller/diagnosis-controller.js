const ApiResponse = require("../utils/api-response");
const diagnosisService = require("../service/diagnosis-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getDiagnosisPool = (user) => {
    // Infer location from the authenticated user or default
    const location = user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance directly
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          DIAGNOSIS CONTROLLERS
// -------------------------------------------------------------------------

async function addDiagnosis(req, res) {
    const pool = getDiagnosisPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;
        const diagnosisData = req.body;

        console.log("Controller received request to add diagnosis for patient_id:", patient_id);

        if (!patient_id || isNaN(Number(patient_id))) {
            return res.status(400).send(new ApiResponse(400, "Invalid or missing patient_id.", null, null));
        }
        if (!diagnosisData || Object.keys(diagnosisData).length === 0) {
            return res.status(400).send(new ApiResponse(400, "Diagnosis data cannot be empty.", null, null));
        }

        // ✅ PASS THE POOL as the first argument
        const result = await diagnosisService.addDiagnosis(
            pool,
            Number(patient_id),
            diagnosisData,
        );
        console.log("Add diagnosis Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while adding diagnosis:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while adding diagnosis.", null, error.message));
    }
}

const updateDiagnosis = async (req, res) => {
    const pool = getDiagnosisPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    const { patient_id } = req.params;
    const updatedDiagnosisData = req.body;

    try {
        // ✅ PASS THE POOL as the first argument
        const response = await diagnosisService.updateDiagnosis(
            pool,
            patient_id,
            updatedDiagnosisData,
        );

        // Service returns ApiResponse object, check status code for response
        return res.status(response.statusCode).json(response);
    } catch (error) {
        console.error("Controller: Error in updateDiagnosis:", error.message);
        return res
            .status(500)
            .json(new ApiResponse(500, "Error while updating patient diagnosis.", null, error.message));
    }
};

async function listDiagnosis(req, res) {
    const pool = getDiagnosisPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }
    
    try {
        const { patient_id } = req.params;
        console.log("Controller received request to list diagnosis for patient_id:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await diagnosisService.listDiagnosis(pool, patient_id);
        console.log("Get diagnosis Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while fetching patient diagnosis:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while fetching patient diagnosis.", null, error.message));
    }
}

async function listAllDiagnosis(req, res) {
    const pool = getDiagnosisPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        console.log("Received request to list all diagnoses.");

        // ✅ PASS THE POOL as the first argument
        const response = await diagnosisService.listAllDiagnosis(pool);

        // Service returns an ApiResponse object
        return res.status(response.statusCode).json(response);
    } catch (error) {
        console.error("Error in diagnosis controller:", error.message);
        // Catch raw errors thrown by the service and format them
        return res.status(500).json(new ApiResponse(500, "Internal Server Error", null, error.message));
    }
}

async function addDoctorComment(req, res) {
    const pool = getDiagnosisPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;
        const commentData = req.body;
        console.log("Controller received request to add comment for patient_id:", patient_id);

        if (!patient_id) {
            return res.status(400).send(new ApiResponse(400, "Invalid or missing patient_id.", null, null));
        }

        // ✅ PASS THE POOL as the first argument
        const response = await diagnosisService.addDoctorComment(pool, patient_id, commentData);

        return res.status(response.statusCode).send(response);
    } catch (error) {
        console.error("Error in addDoctorComment:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while adding comment.", null, error.message));
    }
}

module.exports = {
    addDiagnosis,
    updateDiagnosis,
    listDiagnosis,
    listAllDiagnosis,
    addDoctorComment,
};