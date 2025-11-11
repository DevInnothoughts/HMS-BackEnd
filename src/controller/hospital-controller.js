const ApiResponse = require("../utils/api-response");
const HospitalService = require("../service/hospital-services");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getHospitalPool = (user) => {
    // Infer location from the authenticated user or default
    const location = user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          HOSPITAL CONTROLLERS
// -------------------------------------------------------------------------

/**
 * Add a new hospital (Requires pool for insertion/existence check)
 */
async function addHospital(req, res, next) {
  const pool = getHospitalPool(req.user);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }
  
  try {
    console.log("Controller received request to add hospital:", req.body);
    
    // ✅ PASS THE POOL as the first argument
    const result = await HospitalService.addHospital(pool, req.body, req.user);
    
    console.log("Add Hospital Controller Result:", result);
    // Service returns an ApiResponse object
    return res.status(result.statusCode).send(result);

  } catch (error) {
    console.error("Error while adding hospital:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding hospital.",
          null,
          error.message,
        ),
      );
  }
}

/**
 * List all hospitals (Requires pool for fetching data)
 */
async function listHospital(req, res, next) {
  const pool = getHospitalPool(req.user);
  
  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to list all hospitals.");
    
    // ✅ PASS THE POOL as the first argument
    const hospitals = await HospitalService.listHospital(pool);
    
    console.log("List hospital Result: Found", hospitals.length, "records.");
    
    // Service returns raw data array, wrap it in ApiResponse here
    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          "Hospitals fetched successfully.",
          null,
          hospitals,
        ),
      );
  } catch (error) {
    console.error("Error while fetching hospitals:", error.message);
    // Service throws an Error object, catch and wrap it.
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching hospitals.",
          null,
          error.message,
        ),
      );
  }
}

module.exports = {
  addHospital,
  listHospital,
};