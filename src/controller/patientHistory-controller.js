const ApiResponse = require("../utils/api-response");
const patientHistoryService = require("../service/patientHistory-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getPatientHistoryPool = (req) => {
    // Infer location from the authenticated user or default
    const location = req.query?.location || req.user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                         PATIENT HISTORY CONTROLLERS
// -------------------------------------------------------------------------

// Update historyChk flag when history button is clicked
async function updateHistoryChk(req, res) {
    const pool = getPatientHistoryPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;
        console.log("Controller received request to update historyChk:", patient_id);
        
        if (!patient_id)
            return res.status(400).send(new ApiResponse(400, "patient ID is required.", null, null));

        // ✅ PASS THE POOL as the first argument
        const result = await patientHistoryService.updateHistoryChk(pool, patient_id);
        
        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while updating historyChk:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while updating historyChk.", null, error.message));
    }
}

async function addPatientHistory(req, res) {
    const pool = getPatientHistoryPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;
        const patientData = req.body;

        console.log("Controller received request to add PatientHistory for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await patientHistoryService.addPatientHistory(
            pool,
            patientData,
            patient_id,
        );
        console.log("Add PatientHistory Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while adding PatientHistory:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while adding PatientHistory.", null, error.message));
    }
}

async function updatePatientHistory(req, res) {
    const pool = getPatientHistoryPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    const { patient_id } = req.params;
    const updatedPatientHistoryData = req.body;

    try {
        console.log("Controller received request to update PatientHistory for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const response = await patientHistoryService.updatePatientHistory(
            pool,
            patient_id,
            updatedPatientHistoryData,
        );

        // Service returns an ApiResponse object, use its status code
        return res.status(response.statusCode).send(response);
    } catch (error) {
        console.error("Error in updatePatientHistoryController:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while updating patient history.", null, error.message));
    }
}

async function listPatientHistory(req, res) {
    const pool = getPatientHistoryPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { patient_id } = req.params;

        console.log("Controller received request to list patient history for patient:", patient_id);

        // ✅ PASS THE POOL as the first argument
        const result = await patientHistoryService.listPatientHistory(pool, patient_id);
        console.log("Get PatientHistory Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while fetching patient history:", error.message);
        return res
            .status(500)
            .send(new ApiResponse(500, "Error while fetching patient history.", null, error.message));
    }
}

module.exports = {
    addPatientHistory,
    updatePatientHistory,
    listPatientHistory,
    updateHistoryChk,
};