const ApiResponse = require('../utils/api-response');
const EnquiryService = require('../service/enquiry-services.js');

// Add a new enquiry
async function addEnquiry(req, res, next) {
    try {
        console.log("Controller received request to add enquiry:", req.body);

        // Call the service to add enquiry without validation
        const result = await EnquiryService.addEnquiry(req.body, req.user);
        console.log("Add Enquiry Controller Result:", result);

        // Validate and use a default status code if undefined or invalid
        const statusCode = result.statusCode && Number.isInteger(result.statusCode) ? result.statusCode : 500;
        const message = result.message || "An unexpected error occurred.";
        const data = result.data || null;

        res.status(statusCode).json({
            statusCode,
            message,
            data,
        });
    } catch (error) {
        console.error("Error while adding enquiry:", error);

        // Default response for unhandled errors
        res.status(500).send({
            statusCode: 500,
            message: "Error while adding enquiry.",
            data: null,
        });
    }
}


// List all enquiries
async function listEnquiry(req, res, next) {
    try {
        console.log("Controller received request to list all enquiries with query params:", req.query);

        // Pass query parameters to the service function (req.query contains query params from URL)
        const enquiries = await EnquiryService.listEnquiry(req.query);
        console.log("List Enquiry Result:", enquiries);

        res.status(200).send(new ApiResponse(200, "Enquiry list fetched successfully.", null, enquiries));
    } catch (error) {
        console.error("Error while fetching enquiries:", error.message);
        res.status(500).send(new ApiResponse(500, "Error while fetching enquiries.", null, error.message));
    }
}

async function doctorDropdown(req, res, next) {
    try {
        console.log("Controller received request to fetch doctor dropdown");
        const data = await EnquiryService.doctorDropdown();

        if (data.length === 0) {
            return res.status(404).send(new ApiResponse(404, "No doctor data found.", null, []));
        }

        res.status(200).send(new ApiResponse(200, "Doctor dropdown fetched successfully.", null, data));
    } catch (error) {
        console.error("Error while fetching doctor dropdown:", error.message);
        res.status(500).send(new ApiResponse(500, "Error while fetching doctor dropdown.", null, error.message));
    }
}

module.exports = {
addEnquiry,listEnquiry,doctorDropdown
};