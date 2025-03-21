const ApiResponse = require('../utils/api-response');
const USER_ROLE = require('../constants/role-constant');
const DoctorDb = require('../database/doctorDb');
const enquiryDb = require('../database/enquiryDb.js');
const moment = require("moment");


async function addEnquiry(enquiry) {
  try {
    const formattedDate = new Date(enquiry.date);

    const newEnquiry = new enquiryDb({
      date: formattedDate,
      doctorId: enquiry.doctorId,
      enquirytype: enquiry.enquirytype,
      patient_name: enquiry.patient_name,
      patient_phone: enquiry.patient_phone,
      patient_location: enquiry.patient_location,
      reference: enquiry.reference,
      FDE_Name: enquiry.FDE_Name,
      note: enquiry.note,
    });

    await newEnquiry.save();
    console.log("Enquiry successfully saved:", newEnquiry);

    return { status: 201, message: "Enquiry added successfully." };
  } catch (error) {
    console.error("Error saving enquiry:", error);

    // Always return a proper error object
    return { status: 500, message: "Error saving enquiry." };
  }
}


async function listEnquiry(queryParams) {
  try {
    // Convert 'DD-MM-YYYY' to Date format
    const fromDate = moment(queryParams.from, "DD-MM-YYYY").startOf("day").toDate();
    const toDate = moment(queryParams.to, "DD-MM-YYYY").endOf("day").toDate();

    console.log("Converted Date Range:", fromDate, toDate);

    const filter = {
      date: { $gte: fromDate, $lte: toDate }
    };

    const enquiries = await enquiryDb.find(filter);
    
    console.log("Enquiry Results:", enquiries);

    return enquiries;
  } catch (error) {
    console.error("Error while fetching enquiries:", error);
    throw new Error("Unable to fetch enquiries.");
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

module.exports = { addEnquiry, listEnquiry, doctorDropdown };
