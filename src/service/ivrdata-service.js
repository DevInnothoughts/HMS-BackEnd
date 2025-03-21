const ApiResponse = require('../utils/api-response');
const IvrdataDb = require('../database/ivrdataDb');
const DoctorDb = require('../database/doctorDb');
const FdedetailsDb = require('../database/fdedetailsDb');
const EnquiryDb = require('../database/enquiryDb');

async function listIvrdata(filters) {
    try {
        const { from, to } = filters;
        console.log("Received dates:", from, to);

        const query = {};

        if (from) {
            query.call_date = { $gte: from };
        }

        if (to) {
            query.call_date = query.call_date 
                ? { ...query.call_date, $lte: to } 
                : { $lte: to };
        }

        const ivrdata = await IvrdataDb.find(query);
        return ivrdata;
    } catch (error) {
        console.log("Error while listing IVR data:", error.message);
        throw new Error("Unable to fetch IVR data list");
    }
}

// Function to fetch doctor dropdown data
async function doctorDropdown() {
    try {
        return await DoctorDb.find({}, 'doctor_id name');
    } catch (error) {
        console.error("Error in service layer while fetching doctor dropdown:", error.message);
        throw new Error("Unable to fetch doctor dropdown.");
    }
}

// Function to fetch FDE dropdown data
async function fdeDropdown() {
    try {
        return await FdedetailsDb.find({}, 'FDEID FDEName');
    } catch (error) {
        console.error("Error in service layer while fetching FDE dropdown:", error.message);
        throw new Error("Unable to fetch FDE dropdown.");
    }
}

// Function to fetch enquiry dropdown data
async function enquiryDropdown() {
    try {
        return await EnquiryDb.find({}, 'enquiry_id enquirytype').sort({ enquiry_id: -1 });
    } catch (error) {
        console.error("Error in service layer while fetching enquiry dropdown:", error.message);
        throw new Error("Unable to fetch enquiry dropdown.");
    }
}

async function editNote(ivr_id, data) {
    try {
        // Convert IVR ID to a number to match MongoDB's Int32 type
        ivr_id = Number(ivr_id);
        if (!ivr_id || isNaN(ivr_id)) {
            console.log("Invalid IVR ID received:", ivr_id);
            return { success: false, message: "Invalid IVR ID." };
        }

        console.log("Received IVR ID:", ivr_id);
        console.log("Received Note Data:", data);

        // Ensure `data` is an object and extract `note` correctly
        if (typeof data === "object" && data !== null && typeof data.note === "string") {
            data = data.note.trim();
        } else {
            console.log("Invalid note format:", data);
            return { success: false, message: "Note must be a valid string." };
        }

        // Log MongoDB query for debugging
        console.log("Querying MongoDB with:", { ivr_id });

        // Perform update in MongoDB
        const updatedNote = await IvrdataDb.findOneAndUpdate(
            { ivr_id: ivr_id },  // Ensure matching by Int32
            { $set: { note: data } }, // Update only the note field
            { new: true }
        );

        if (!updatedNote) {
            console.log("No record found for IVR ID:", ivr_id);
            return { success: false, message: `No record found with IVR ID ${ivr_id}.` };
        }

        console.log("Note updated successfully:", updatedNote);
        return { success: true, data: updatedNote };

    } catch (error) {
        console.error("Error while updating note:", error);
        return { success: false, message: "Error updating note.", error: error.toString() };
    }
}

module.exports = {
    listIvrdata,
    doctorDropdown,
    fdeDropdown,
    enquiryDropdown,
    editNote
};
