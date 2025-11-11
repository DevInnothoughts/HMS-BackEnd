const ApiResponse = require("../utils/api-response");
const ReceptionistService = require("../service/receptionist-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getReceptionistPool = (user) => {
    // Infer location from the authenticated user or default
    const location = user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                         RECEPTIONIST CONTROLLERS
// -------------------------------------------------------------------------

// Add a new receptionist
async function addReceptionist(req, res, next) {
  const pool = getReceptionistPool(req.user);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }
  
  try {
    console.log("Controller received request to add receptionist:", req.body.Email);
    
    // ✅ PASS THE POOL as the first argument
    const result = await ReceptionistService.addReceptionist(
      pool,
      req.body,
      req.user,
    );
    
    console.log("Add Receptionist Controller Result:", result);
    // Service returns an ApiResponse object, use its status code
    return res.status(result.statusCode).send(result);

  } catch (error) {
    console.error("Error while adding receptionist:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding receptionist.",
          null,
          error.message,
        ),
      );
  }
}

module.exports = {
  addReceptionist,
};