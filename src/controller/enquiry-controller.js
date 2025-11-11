const ApiResponse = require('../utils/api-response');
const EnquiryService = require('../service/enquiry-services.js');
const { getConnectionByLocation } = require('../config/dbConnection.js');

// Helper function to simulate pool retrieval (replace with your actual implementation)
const getEnquiryPoolByLocation = (location) => {
    return getConnectionByLocation(location).connection;
};

// Helper to infer location from request objects
function inferLocation(req) {
    return req.body?.patient_location || req.query?.location || req.user?.location || 'default';
}

// -------------------------------------------------------------------------

/**
 * Add a new enquiry
 */
async function addEnquiry(req, res, next) {
    const location = inferLocation(req);
    const pool = getEnquiryPoolByLocation(location);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed for location.", null, null));
    }

    try {
        console.log("Controller received request to add enquiry:", req.body);

        // ✅ PASS THE POOL AS THE FIRST ARGUMENT
        const result = await EnquiryService.addEnquiry(pool, req.body);
        console.log("Add Enquiry Controller Result:", result);

        // Service now returns an ApiResponse object, use its properties directly
        return res.status(result.statusCode).json(result);

    } catch (error) {
        console.error("Error while adding enquiry:", error.message);
        
        // Use the error information from the service layer if possible, otherwise default.
        const statusCode = error.statusCode || 500;
        const message = error.message || "Error while adding enquiry.";

        return res.status(statusCode).send(new ApiResponse(statusCode, message, null, error.message));
    }
}

/**
 * List all enquiries
 */
async function listEnquiry(req, res, next) {
    const location = inferLocation(req);
    const pool = getEnquiryPoolByLocation(location);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed for location.", null, null));
    }
    
    try {
        console.log("Controller received request to list all enquiries with query params:", req.query);

        // ✅ PASS THE POOL AS THE FIRST ARGUMENT ALONG WITH QUERY PARAMS
        const enquiries = await EnquiryService.listEnquiry(pool, req.query);
        console.log("List Enquiry Result:", enquiries.length, "records.");

        // The service layer returns raw rows, wrap it in ApiResponse here
        return res.status(200).send(new ApiResponse(200, "Enquiry list fetched successfully.", null, enquiries));
    } catch (error) {
        console.error("Error while fetching enquiries:", error.message);
        // The service throws a raw Error object, catch it here.
        return res.status(500).send(new ApiResponse(500, "Error while fetching enquiries.", null, error.message));
    }
}

/**
 * Fetch doctor dropdown
 */
async function doctorDropdown(req, res, next) {
    const location = inferLocation(req);
    const pool = getEnquiryPoolByLocation(location);

    if (!pool) {
        return res.status(500).send(new ApiResponse(500, "Database connection failed for location.", null, null));
    }
    
    try {
        console.log("Controller received request to fetch doctor dropdown");

        // ✅ PASS THE POOL AS THE FIRST ARGUMENT
        const data = await EnquiryService.doctorDropdown(pool);

        if (data.length === 0) {
            return res.status(404).send(new ApiResponse(404, "No doctor data found.", null, []));
        }

        return res.status(200).send(new ApiResponse(200, "Doctor dropdown fetched successfully.", null, data));
    } catch (error) {
        console.error("Error while fetching doctor dropdown:", error.message);
        return res.status(500).send(new ApiResponse(500, "Error while fetching doctor dropdown.", null, error.message));
    }
}

module.exports = {
    addEnquiry,
    listEnquiry,
    doctorDropdown
};