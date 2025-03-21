const ApiResponse = require("../utils/api-response");
const patientDb = require("../database/patientDb");
const refDocDb = require("../database/refDocDb.js");

function convertToDate(dateString) {
  if (!dateString) return null; // Handle null/undefined dates

  // Check if the date is already a Date object
  if (dateString instanceof Date) {
    // If it is a Date object, directly format it to dd/mm/yyyy
    const day = String(dateString.getDate()).padStart(2, "0");
    const month = String(dateString.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = dateString.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Otherwise, treat it as a string and process it
  if (typeof dateString === "string") {
    const date = new Date(dateString); // Convert string to Date
    if (isNaN(date)) return null; // Invalid date

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return null;
}

const { formatDate } = require("../utils/formatDate.js");

async function personal(patient_id) {
  try {
    const patient = await patientDb.findOne({ patient_id });

    if (!patient) {
      throw new Error("Patient not found.");
    }

    patient.date = formatDate(patient.date);
    patient.birth_date = formatDate(patient.birth_date);

    return {
      statusCode: 200,
      message: "Personal fetched successfully.",
      data: patient,
    };
  } catch (error) {
    console.log("Error while fetching patient: ", error.message);
    throw new Error("Unable to fetch patient.");
  }
}

async function editPersonal(patient_id, updatedData) {
  try {
    // Find the patient by patient_id
    let patientData = await patientDb.findOne({
      patient_id: String(patient_id), // Ensure consistency in the field name
    });

    // If no patient is found, return an error response
    if (!patientData) {
      return new ApiResponse(400, "Patient not found for update", null, null);
    }

    // Merge the provided updated data with the existing patient data
    const payload = { ...patientData.toObject(), ...updatedData };

    // Ensure we are updating the correct patient and remove any unwanted field (_id)
    delete payload._id; // Do not update _id

    // Update the patient record in the database
    const updatedPatient = await patientDb.findOneAndUpdate(
      { patient_id: patient_id }, // Find the patient by their unique ID
      payload,
      { new: true }, // Return the updated document
    );

    // If the update fails, return an error response
    if (!updatedPatient) {
      return new ApiResponse(
        500,
        "Error while updating the patient.",
        null,
        null,
      );
    }

    // Format the date to dd/mm/yyyy
    if (updatedPatient.date) {
      const dateObj = new Date(updatedPatient.date);
      const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
      updatedPatient.date = formattedDate;
    }

    // Return a success response with updated patient details
    return new ApiResponse(
      200,
      "Patient details updated successfully.",
      null,
      updatedPatient, // Display the updated patient details
    );
  } catch (error) {
    // Log the error and return a failure response
    console.error("Error while updating patient details:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating patient details.",
      null,
      error.message,
    );
  }
}

// async function editPersonal(patient_id, updatedPatientData,
//   updatedRefDocData
// ) {
//     try {
//         const patientData = await patientDb.findOne({ patient_id });

//         // if (!patientData) {
//         //     return new ApiResponse(404, `No patient found with ID: ${patient_id}`, null, null);
//         // }

//         const refDocData = await refDocDb.findOne({ patient_id });

//         // if (!refDocData) {
//         //     return new ApiResponse(404, `No diagnosis found for patient ID: ${patient_id}`, null, null);
//         // }
//         const date = updatedPatientData?.date ? convertToDate(updatedPatientData.date) : patientData.date;

//         // Combine and update data
//         const combinedData = {
//             patient_id,
//             Uid_no: updatedPatientData?.Uid_no || patientData.Uid_no,
//             patientName: updatedPatientData?.patientName || patientData.name,
//             age: updatedPatientData?.age || patientData.age,
//             mobileNo: updatedPatientData?.mobileNo || patientData.phone,
//             address: updatedPatientData?.address || patientData.address,
//             occupation: updatedPatientData?.occupation || patientData.occupation,
//             email: updatedPatientData?.email || patientData.email,
//             reference_type: updatedPatientData?.reference_type || patientData.reference_type,
//             ref: updatedPatientData?.ref || patientData.ref,
//             mobile_2:updatedPatientData?.mobile_2 || patientData.mobile_2,
//             sex:updatedPatientData?.sex || patientData.sex,
//             identity:updatedPatientData?.identity || patientData.identity,
//             birth_date:updatedPatientData?.birth_date || patientData.birth_date,
//             specific_work:updatedPatientData?.specific_work || patientData.specific_work,
//             date:updatedPatientData?.date || patientData.date,
//             pincode:updatedPatientData?.pincode || patientData.pincode,
//             blood_group:updatedPatientData?.blood_group || patientData.blood_group,
//             companyname:updatedPatientData?.companyname || patientData.companyname,

//             ref_doctor_name:updatedRefDocData?.ref_doctor_name || refDocData.ref_doctor_name,
//             ref_doctor_phone:updatedRefDocData?.ref_doctor_phone || refDocData.ref_doctor_phone,
//             reference_doctor_speciality:updatedRefDocData?.reference_doctor_speciality || refDocData.reference_doctor_speciality,
//             reference_doctor_location:updatedRefDocData?.reference_doctor_location || refDocData.reference_doctor_location,

//         };

//         // Save the combined data in the followUp database
//         await patientDb.updateOne(
//             { patient_id }, // Match patient_id
//             { $set: combinedData }, // Update with combined data
//             { new: true } // Insert if not already exists
//         );

//         return new ApiResponse(200, "Personal data updated successfully", combinedData, null);
//     } catch (error) {
//         console.error(`Error updating Personal data for patient ID ${patient_id}:`, error.message);

//         return new ApiResponse(500, 'Personal database update failed.', null, error.message);
//     }

// }

module.exports = {
  personal,
  editPersonal,
};
