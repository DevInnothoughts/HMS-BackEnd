const ApiResponse = require("../utils/api-response");
const PatientService = require("../service/patient-services");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getPatientPool = (req) => {
    // Infer location from query params, body, or user object
    const location = req.query?.location || req.body?.patient_location || req.user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          PATIENT CONTROLLERS
// -------------------------------------------------------------------------

/**
 * 1. Add a new patient
 */
async function addPatient(req, res, next) {
  const pool = getPatientPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }
  
  try {
    console.log("Controller received request to add patient:", req.body);
    
    // ✅ PASS THE POOL as the first argument
    const result = await PatientService.addPatient(pool, req.body);
    
    console.log("Add Patient Controller Result:", result);
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding patient:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(500, "Error while adding patient.", null, error.message)
      );
  }
}

/**
 * 2. Edit an existing patient
 */
async function editPatient(req, res, next) {
    // Note: The patient_id should come from req.params if using a RESTful route like /:patient_id
    // The current code uses req.query.patient_id, which is fine if that's the setup.
    
    // Check if patient_id is in params, fallback to query for robustness
    const patient_id = req.params.patient_id || req.query.patient_id;
    const location = req.query.location;
    
    const pool = getPatientPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }
    
    try {
        console.log("Controller received request to edit patient ID:", patient_id);
        
        if (!patient_id) {
            return res.status(400).send(new ApiResponse(400, "Missing patient ID for edit.", null, null));
        }

        // ✅ PASS THE POOL as the first argument
        const result = await PatientService.editPatient(
            pool,
            patient_id, // Pass ID
            req.body,
            req.user,
            location // Pass location explicitly for service visibility
        );
        
        console.log("Edit Patient Controller Result:", result);
        return res.status(result.statusCode).send(result);
    } catch (error) {
        console.error("Error while editing patient:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while editing patient.",
                    null,
                    error.message
                )
            );
    }
}

/**
 * 3. List all patients
 */
async function listPatient(req, res, next) {
    const pool = getPatientPool(req);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }

    try {
        console.log("Controller received request to list all patients.");
        
        // The service function lists based on the query object (req.query)
        // ✅ PASS THE POOL as the first argument
        const patients = await PatientService.listPatient(pool, req.query);
        
        console.log("List Patient Result: Found", patients.length, "records.");
        // Service returns raw data array, wrap it in ApiResponse here
        return res
            .status(200)
            .send(
                new ApiResponse(200, "Patients fetched successfully.", null, patients)
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
                    error.message
                )
            );
    }
}

module.exports = {
  addPatient,
  editPatient,
  listPatient,
};