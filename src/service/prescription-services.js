const ApiResponse = require("../utils/api-response");
const otherTestsDb = require("../database/otherTestsDb");
const prescriptionOpdDb = require("../database/prescriptionOpdDb");
const urologyDb = require("../database/urologyDb");
const appointmentDb = require("../database/appointmentDb");

async function addPrescription(patient_id, prescriptionData) {
  console.log("Service received request for patient ID:", patient_id);

  try {
    // Check if the patient already exists in patientHistoryDb using patient_id
    const prescriptionOpdDbExist = await prescriptionOpdDb.findOne({
      patient_id,
    });
    if (prescriptionOpdDbExist) {
      return new ApiResponse(
        400,
        "Patient already registered with the provided patient_id",
        null,
        null,
      );
    }

    // Create a new patient history record using patient_id
    const newPrescription = new prescriptionOpdDb({
      patient_id,
      prescription_type: prescriptionData.prescription_type,
      allergy: prescriptionData.allergy,
      diagnosis: prescriptionData.diagnosis,
      advicesx: prescriptionData.advicesx,
      admmisionnote: prescriptionData.admmisionnote,
      medicine_name: prescriptionData.medicine_name,
      medicine_time: prescriptionData.medicine_time,
      medicine_quantity: prescriptionData.medicine_quantity,
      medicine_days: prescriptionData.medicine_days,
      next_appointment: prescriptionData.next_appointment,
      next_appointmentDate: prescriptionData.next_appointmentDate,
      prescription_date: prescriptionData.prescription_date,
      assistant_doctor: prescriptionData.assistant_doctor,
      surgeryadvice: prescriptionData.surgeryadvice,
    });
    const newUrology = new urologyDb({
      patient_id,
      investigation: prescriptionData.investigation,
    });

    const urologyResult = await newUrology.save();
    console.log("urology successfully registered", urologyResult);

    const newAppointment = new appointmentDb({
      patient_id,
      patient_type: prescriptionData.patient_type,
      appointment_timestamp: prescriptionData.appointment_timestamp
    });

    const appointmentResult = await newAppointment.save();
    console.log("appointment successfully registered", appointmentResult);

    // Save the patient history record
    const prescriptionResult = await newPrescription.save();
    console.log(
      "Patient prescription successfully registered",
      prescriptionResult,
    );
    return new ApiResponse(201, "prescription registered successfully.", null, {
      prescription: prescriptionResult,
      appointment: appointmentResult,
      urology: urologyResult,
    });
  } catch (error) {
    console.error("Error while registering prescription: ", error.message);
    return new ApiResponse(
      500,
      "Exception while prescription registration.",
      null,
      error.message,
    );
  }
}

async function updatePrescription(patient_id, updatedOpd_prescriptionData) {
  try {
    console.log(
      "Service received request to update prescription card for patient_id:",
      patient_id,
    );

    let opd_prescriptionData = await prescriptionOpdDb.findOne({ patient_id });

    if (!opd_prescriptionData) {
      return new ApiResponse(
        400,
        "prescription Card Data not found for update",
        null,
        null,
      );
    }

    const updatedData = {
      ...opd_prescriptionData.toObject(),
      ...updatedOpd_prescriptionData,
    };

    delete updatedData._id; // Do not update _id

    const updatedOpd_prescription = await prescriptionOpdDb.findOneAndUpdate(
      { patient_id }, // Find the patient by their unique ID
      updatedData,
      { new: true }, // Return the updated document
    );

    if (!updatedOpd_prescription) {
      return new ApiResponse(
        500,
        "Error while updating the prescription card.",
        null,
        null,
      );
    }

    // Update medication history
    const updatedUrology = await urologyDb.findOneAndUpdate(
      { patient_id },
      {
        $set: {
          investigation:
            updatedOpd_prescriptionData.investigation ||
            opd_prescriptionData.investigation,
        },
      },
      { new: true },
    );
     const updatedAppointment = await appointmentDb.findOneAndUpdate(
      { patient_id },
      {
        $set: {
          patient_type: 
            updatedOpd_prescriptionData.patient_type ||
            opd_prescriptionData.patient_type,
          appointment_timestamp:
            updatedOpd_prescriptionData.appointment_timestamp ||
            opd_prescriptionData.appointment_timestamp,
        },
      },
      { new: true },
    );

    // if (!updatedSurgicalAdvice) {
    //     return new ApiResponse(500, "Error while updating the prescription.", null, null);
    // }

    // Return the updated data response
    return new ApiResponse(200, "prescription updated successfully.", null, {
      prescription: updatedOpd_prescription,
      appointment: updatedAppointment,
      urology: updatedUrology,
    });
  } catch (error) {
    console.error("Error while updating prescription:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating prescription.",
      null,
      error.message,
    );
  }
}

async function listPrescription(patient_id) {
  console.log(
    "Service received request to list prescription for patient_id:",
    patient_id,
  );

  try {
    const prescription = await prescriptionOpdDb.findOne({ patient_id });

    console.log("Fetched patient prescription:", prescription);

    const urology = await urologyDb.find({ patient_id });

    // Log the fetched medication history for debugging
    console.log("Fetched urology:", urology);

    const appointment = await appointmentDb.find({ patient_id });

    console.log("Fetched Appointment:", appointment)
    if (!prescription) {
      return new ApiResponse(
        404,
        "Patient prescription not found for the provided patient_id",
        null,
        null,
      );
    }

    // Return the successful response with both patient and medication history
    return new ApiResponse(200, "prescription fetched successfully.", null, {
      prescription,
      appointment,
      urology,
    });
  } catch (error) {
    console.error("Error while fetching patient prescription:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching patient prescription.",
      null,
      error.message,
    );
  }
}
// async function opd_prescription(patient_id, updatedOpd_prescriptionData) {
//     try {
//       // Find the patient by patient_id
//       let patientData = await prescriptionOpdDb.findOne({
//         patient_id: patient_id // Ensure consistency in the field name
//       });

//       // If no patient is found, return an error response
//       if (!patientData) {
//         return new ApiResponse(
//           400,
//           "Patient not found for update",
//           null,
//           null
//         );
//       }

//       // Merge the provided updated data with the existing patient data
//       const payload = { ...patientData.toObject(), ...updatedOpd_prescriptionData };

//       // Ensure we are updating the correct patient and remove any unwanted field (_id)
//       delete payload._id; // Do not update _id

//       // Update the patient record in the database
//       const combinedData = await prescriptionOpdDb.findOneAndUpdate(
//         { patient_id: patient_id }, // Find the patient by their unique ID
//         payload,
//         { new: true } // Return the updated document
//       );

//       // If the update fails, return an error response
//       if (!combinedData) {
//         return new ApiResponse(
//           500,
//           "Error while updating the patient.",
//           null,
//           null
//         );
//       }

//       // Return a success response with updated patient details
//       return new ApiResponse(
//         200,
//         "Patient details updated successfully.",
//         null,
//         combinedData // Display the updated patient details
//       );
//     } catch (error) {
//       // Log the error and return a failure response
//       console.error("Error while updating patient details:", error.message);
//       return new ApiResponse(
//         500,
//         "Exception while updating patient details.",
//         null,
//         error.message
//       );
//     }
//   }

// async function opd_prescription(patient_id, updatedOpd_prescriptionData,updatedUrologyData) {
//     try {
//         const opd_prescriptionData = await prescriptionOpdDb.findOne({ patient_id });

//         // if (!opd_prescriptionData) {
//         //     return new ApiResponse(404, `No patient found with ID: ${patient_id}`, null, null);
//         // }
//         const urologyData = await urologyDb.findOne({ patient_id });

//         // Combine and update data
//         const combinedData = {
//             patient_id,
//             prescription_type: updatedOpd_prescriptionData?.prescription_type || opd_prescriptionData.prescription_type,
//             allergy: updatedOpd_prescriptionData?.allergy || opd_prescriptionData.allergy,
//             diagnosis: updatedOpd_prescriptionData?.diagnosis || opd_prescriptionData.diagnosis,
//             advicesx: updatedOpd_prescriptionData?.advicesx || opd_prescriptionData.advicesx,
//             admmisionnote: updatedOpd_prescriptionData?.admmisionnote || opd_prescriptionData.admmisionnote,
//             medicine_time: updatedOpd_prescriptionData?.medicine_time || opd_prescriptionData.medicine_time,
//             medicine_quantity: updatedOpd_prescriptionData?.medicine_quantity || opd_prescriptionData.medicine_quantity,
//             medicine_days: updatedOpd_prescriptionData?.medicine_days || opd_prescriptionData.medicine_days,
//             next_appointment: updatedOpd_prescriptionData?.next_appointment || opd_prescriptionData.next_appointment,
//             next_appointmentDate: updatedOpd_prescriptionData?.next_appointmentDate || opd_prescriptionData.next_appointmentDate,
//             prescription_date: updatedOpd_prescriptionData?.prescription_date || opd_prescriptionData.prescription_date,
//             assistant_doctor: updatedOpd_prescriptionData?.assistant_doctor || opd_prescriptionData.assistant_doctor,
//             surgeryadvice:updatedOpd_prescriptionData?.surgeryadvice || opd_prescriptionData.surgeryadvice,

//             investigation:updatedUrologyData?.investigation || urologyData.investigationinvestigation,

//         };

//         // Save the combined data in the followUp database
//         await prescriptionOpdDb.updateOne(
//             { patient_id }, // Match patient_id
//             { $set: combinedData }, // Update with combined data
//             { upsert: true } // Insert if not already exists
//         );

//         return new ApiResponse(200, "Surgery details data updated successfully", combinedData, null);
//     } catch (error) {
//         console.error(`Error updating Surgery details data for patient ID ${patient_id}:`, error.message);

//         return new ApiResponse(500, 'Surgery details database update failed.', null, error.message);
//     }
// }

// async function listPrescription(patient_id) {
//     try {
//         const opd_prescriptionData = await prescriptionOpdDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id:1,
//                     prescription_type: 1,
//                     allergy: 1,
//                     diagnosis: 1,
//                     advicesx: 1,
//                     admmisionnote: 1,
//                     medicine_time: 1,
//                     medicine_quantity: 1,
//                     medicine_days: 1,
//                     next_appointment: 1,
//                     next_appointmentDate: 1,
//                     prescription_date: 1,
//                     assistant_doctor: 1,
//                     surgeryadvice: 1,

//                 },
//             },
//         ]);

//         opd_prescriptionData.forEach(opd_prescriptionData=>{
//             opd_prescriptionData.next_appointmentDate=convertToDate(opd_prescriptionData.next_appointmentDate);
//             opd_prescriptionData.prescription_date=convertToDate(opd_prescriptionData.prescription_date);
//        });
//         const urologyData = await urologyDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id: 1,
//                     investigation: 1,
//                 },
//             },
//         ]);

//         return {
//             opd_prescriptionData,
//             urologyData,
//         };
//     } catch (error) {
//         console.log("Error while fetching prescription: ", error.message);
//         throw new Error("Unable to fetch prescription.");
//     }
// }

module.exports = {
  addPrescription,
  updatePrescription,
  listPrescription,
};
