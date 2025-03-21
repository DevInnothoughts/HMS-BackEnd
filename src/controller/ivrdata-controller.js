const ApiResponse = require('../utils/api-response');
const  IvrdataService= require('../service/ivrdata-service');

async function listIvrdata(req, res, next) {
    try {
        console.log("Controller received request to list all enquiries with query params:", req.query);

        // Pass query parameters to the service function (req.query contains query params from URL)
        const ivrdata = await IvrdataService.listIvrdata(req.query);
        console.log("List ivrdata Result:", ivrdata);

        res.status(200).send(new ApiResponse(200, "ivrdata list fetched successfully.", null, ivrdata));
    } catch (error) {
        console.error("Error while fetching ivrdata:", error.message);
        res.status(500).send(new ApiResponse(500, "Error while fetching enquiries.",null,error.message));
    }
}


async function doctorDropdown(req, res, next) {
    try {
        console.log("Controller received request to fetch doctor dropdown");
        const data = await IvrdataService.doctorDropdown();

        if (data.length === 0) {
            return res.status(404).send(new ApiResponse(404, "No doctor data found.", null, []));
        }

        res.status(200).send(new ApiResponse(200, "Doctor dropdown fetched successfully.", null, data));
    } catch (error) {
        console.error("Error while fetching doctor dropdown:", error.message);
        res.status(500).send(new ApiResponse(500, "Error while fetching doctor dropdown.", null, error.message));
    }
}

async function fdeDropdown(req, res, next) {
    try {
        console.log("Controller received request to fetch FDE dropdown");
        const data = await IvrdataService.fdeDropdown();

        if (data.length === 0) {
            return res.status(404).send(new ApiResponse(404, "No FDE data found.", null, []));
        }

        res.status(200).send(new ApiResponse(200, "FDE dropdown fetched successfully.", null, data));
    } catch (error) {
        console.error("Error while fetching FDE dropdown:", error.message);
        res.status(500).send(new ApiResponse(500, "Error while fetching FDE dropdown.", null, error.message));
    }
}

async function enquiryDropdown(req, res, next) {
    try {
        console.log("Controller received request to fetch enquiry dropdown");
        const data = await IvrdataService.enquiryDropdown();

        if (data.length === 0) {
            return res.status(404).send(new ApiResponse(404, "No enquiry data found.", null, []));
        }

        res.status(200).send(new ApiResponse(200, "Enquiry dropdown fetched successfully.", null, data));
    } catch (error) {
        console.error("Error while fetching enquiry dropdown:", error.message);
        res.status(500).send(new ApiResponse(500, "Error while fetching enquiry dropdown.", null, error.message));
    }
}

async function editNote(req, res, next) {
    try {
        console.log("Controller received request to edit note with IVR ID:", req.params.ivr_id);

        const ivr_id = req.params.ivr_id;
        const note = req.body;

        const updatedNote = await IvrdataService.editNote(ivr_id, note);

        if (!updatedNote) {
            return res.status(404).send(new ApiResponse(404, "Note not found.", null, null));
        }

        res.status(200).send(new ApiResponse(200, "Note updated successfully.", null, updatedNote));
    } catch (error) {
        console.error("Error while updating note:", error.message);
        res.status(500).send(new ApiResponse(500, "Error while updating note.", null, error.message));
    }
}

module.exports = {
listIvrdata,doctorDropdown,fdeDropdown,enquiryDropdown,editNote
};
