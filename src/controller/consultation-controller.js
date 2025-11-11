const ApiResponse = require("../utils/api-response");
const ConsultationService = require("../service/consultation-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getConsultationPool = (user) => {
    // Infer location from the authenticated user or default
    const location = user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance directly or has a 'connection' property
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                         CONSULTATION CONTROLLERS
// -------------------------------------------------------------------------

// Add a new consultation
async function addConsultation(req, res, next) {
    const pool = getConsultationPool(req.user);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
    }
    
    try {
        console.log("Controller received request to add consultation:", req.body.consultation_name);
        
        // ✅ PASS THE POOL AS THE FIRST ARGUMENT
        const result = await ConsultationService.addConsultation(
            pool,
            req.body,
            req.user,
        );
        
        console.log("Add Consultation Controller Result:", result);
        // Service returns an ApiResponse object, use its status code
        return res.status(result.statusCode).send(result);

    } catch (error) {
        console.error("Error while adding consultation:", error.message);
        return res
            .status(500)
            .send(
                new ApiResponse(
                    500,
                    "Error while adding consultation.",
                    null,
                    error.message,
                ),
            );
    }
}

module.exports = {
    addConsultation,
};