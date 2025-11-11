const ApiResponse = require("../utils/api-response");
const prescriptionService = require("../service/prescription-services");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getPrescriptionPool = (req) => {
    // Infer location from query params, body, or user object
    const location = req.query?.location || req.user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          PRESCRIPTION CONTROLLERS
// -------------------------------------------------------------------------

async function addPrescription(req, res) {
  const pool = getPrescriptionPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    const { patient_id } = req.params;
    const prescriptionData = req.body;

    console.log("Controller received request to add prescription for patient:", patient_id);

    // ✅ PASS THE POOL as the first argument
    const result = await prescriptionService.addPrescription(
      pool,
      patient_id,
      prescriptionData,
    );
    console.log("Add prescription Controller Result:", result);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding prescription:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding prescription.",
          null,
          error.message,
        ),
      );
  }
}

async function updatePrescription(req, res) {
  const pool = getPrescriptionPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  const { patient_id } = req.params;
  const updatedOpd_prescriptionData = req.body;

  try {
    console.log("Controller received request to update prescription for patient:", patient_id);

    // ✅ PASS THE POOL as the first argument
    const response = await prescriptionService.updatePrescription(
      pool,
      patient_id,
      updatedOpd_prescriptionData,
    );
    
    // Service returns an ApiResponse object, use its status code
    return res.status(response.statusCode).send(response);
  } catch (error) {
    console.error("Error in update prescription card Controller:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating prescription card.",
          null,
          error.message,
        ),
      );
  }
}

async function listPrescription(req, res) {
  const pool = getPrescriptionPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    const { patient_id } = req.params;

    console.log("Controller received request to list prescription for patient:", patient_id);

    // ✅ PASS THE POOL as the first argument
    const result = await prescriptionService.listPrescription(pool, patient_id);
    console.log("Get prescription Controller Result:", result);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching patient prescription:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patient prescription.",
          null,
          error.message,
        ),
      );
  }
}

module.exports = {
  addPrescription,
  updatePrescription,
  listPrescription,
};