const ApiResponse = require("../utils/api-response");
const PatientsService = require("../service/Patients-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getPatientsPool = (req) => {
    // Infer location from query params, body, or user object
    const location = req.query?.location || req.body?.patient_location || req.user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          PATIENTS/REF DOC CONTROLLERS
// -------------------------------------------------------------------------

/**
 * 1. List all patients
 */
async function listPatient(req, res, next) {
    const pool = getPatientsPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        console.log("Controller received request to list all patients.");
        
        // ✅ PASS THE POOL as the first argument
        const patient = await PatientsService.listPatient(pool);
        
        console.log("List Patient Result: Found", patient.length, "records.");
        
        // Service returns raw data array, wrap it in ApiResponse here
        return res
            .status(200)
            .send(
                new ApiResponse(200, "Patients fetched successfully.", null, patient),
            );
    } catch (error) {
        console.error("Error while fetching patients:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while fetching patients.",
                    null,
                    error.message,
                ),
            );
    }
}

/**
 * 2. List referral patient details by phone
 */
async function listRefPatient(req, res) {
    const pool = getPatientsPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        const { phone } = req.params;

        console.log("Controller received request to list ref patient data for phone:", phone);

        // ✅ PASS THE POOL as the first argument
        const result = await PatientsService.listRefPatient(pool, phone);
        
        console.log("Get ref patient data Controller Result:", result);

        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while fetching ref patient data:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while fetching patient data.",
                    null,
                    error.message,
                ),
            );
    }
}

/**
 * 3. List all referral doctors
 */
async function listDoctor(req, res, next) {
    const pool = getPatientsPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }
    
    try {
        console.log("Controller received request to list all doctor.");
        
        // ✅ PASS THE POOL as the first argument
        const doctor = await PatientsService.listDoctor(pool);
        
        console.log("List doctor Result: Found", doctor.length, "records.");
        
        // Service returns raw data array, wrap it in ApiResponse here
        return res
            .status(200)
            .send(new ApiResponse(200, "doctor fetched successfully.", null, doctor));
    } catch (error) {
        console.error("Error while fetching doctor:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while fetching doctor.",
                    null,
                    error.message,
                ),
            );
    }
}

module.exports = {
    listPatient,
    listDoctor,
    listRefPatient,
};