const ApiResponse = require("../utils/api-response");
const patientDb = require("../database/patientDb");
const diagnosisDb = require("../database/diagnosisDb");
const surgeryDetailsDb = require("../database/surgeryDetailsDb");
const followUpDb = require("../database/followUpDb");

async function listFollowUp(patient_id) {
  try {
    const patientData = await patientDb.findOne({ patient_id });

    const diagnosisData = await diagnosisDb.find({ patient_id });

    const followUpData = await followUpDb.findOne({ patient_id });

    return new ApiResponse(
      200,
      "Patient and medication history fetched successfully.",
      null,
      { patientData, diagnosisData, followUpData },
    );
  } catch (error) {
    console.log("Error while fetching followUp data: ", error.message);
    throw new Error("Unable to fetch followUp data.");
  }
}

async function followUp(patient_id, updatedFollowUpData) {
  try {
    console.log(
      "Service received request to update followup for patient_id:",
      patient_id,
    );

    // Find the patient history by patient_id
    let followUpData = await followUpDb.findOne({ patient_id });

    if (!followUpData) {
      return new ApiResponse(400, "follow up not found for update", null, null);
    }

    // Merge the existing data with the updated data
    const updatedData = { ...followUpData.toObject(), ...updatedFollowUpData };

    // Ensure we are updating the correct patient and remove any unwanted field (_id)
    delete updatedData._id; // Do not update _id

    // Update the patient history record in the database
    const updatedFollowUp = await followUpDb.findOneAndUpdate(
      { patient_id }, // Find the patient by their unique ID
      updatedData,
      { new: true }, // Return the updated document
    );

    if (!updatedFollowUp) {
      return new ApiResponse(
        500,
        "Error while updating the follow up.",
        null,
        null,
      );
    }

    // Update medication history
    const updatedPatient = await patientDb.findOneAndUpdate(
      { patient_id },
      {
        $set: {
          Uid_no: updatedFollowUpData.Uid_no || followUpData.Uid_no,
          age: updatedFollowUpData.age || followUpData.age,
          phone: updatedFollowUpData.phone || followUpData.phone,
        },
      },
      { new: true },
    );

    if (!updatedPatient) {
      return new ApiResponse(
        500,
        "Error while updating the patient.",
        null,
        null,
      );
    }

    // Update discharge card (surgical history)
    const updatedDiagnosis = await diagnosisDb.findOneAndUpdate(
      { patient_id },
      {
        $set: {
          advice: updatedFollowUpData.advice || followUpData.advice,
          adviceComment:
            updatedFollowUpData.adviceComment || followUpData.adviceComment,
          diagnosis: updatedFollowUpData.diagnosis || followUpData.diagnosis,
        },
      },
      { new: true },
    );

    if (!updatedDiagnosis) {
      return new ApiResponse(
        500,
        "Error while updating the diagnosis.",
        null,
        null,
      );
    }

    // Return the updated data response
    return new ApiResponse(
      200,
      "follow up ,patient, diagnosis updated successfully.",
      null,
      {
        followUp: updatedFollowUp,
        patient: updatedPatient,
        diagnosis: updatedDiagnosis,
      },
    );
  } catch (error) {
    console.error("Error while updating follow up:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating follow up.",
      null,
      error.message,
    );
  }
}

// async function followUp(patient_id, updatedFollowUpData) {
//   try {
//       console.log(`Updating patient with ID: ${patient_id}`);
//       console.log("Data to update:", updatedFollowUpData);

//       // Fetch data from all relevant databases
//       const patientData = await patientDb.findOne({ patient_id: patient_id });
//       const followUpData = await followUpDb.findOne({ patient_id: patient_id });
//       const diagnosisData = await diagnosisDb.findOne({ patient_id: patient_id });

//       if (!patientData && !followUpData && !diagnosisData) {
//           console.log("Patient not found in any database.");
//           return new ApiResponse(400, "Patient not found for update", null, null);
//       }

//       // Update fields in `patientDb`
//       if (patientData) {
//           const patientFieldsToUpdate = {};
//           const patientDbFields = ["name", "Uid_no", "age", "phone", "address", "occupation", "email", "ref", "date"];
//           patientDbFields.forEach((field) => {
//               if (updatedFollowUpData[field]) {
//                   patientFieldsToUpdate[field] = updatedFollowUpData[field];
//               }
//           });

//           if (Object.keys(patientFieldsToUpdate).length > 0) {
//               const updatedPatient = await patientDb.findOneAndUpdate(
//                   { patient_id: patient_id },
//                   { $set: patientFieldsToUpdate },
//                   { new: true }
//               );

//               if (!updatedPatient) {
//                   console.error("Failed to update patient in patientDb.");
//                   return new ApiResponse(500, "Error while updating patient details in patientDb.", null, null);
//               }
//           }
//       }

//       // Update fields in `followUpDb`
//       if (followUpData) {
//           const followUpFieldsToUpdate = {};
//           const followUpDbFields = ["advice", "diagnosis", "date", "ref"]; // Example fields specific to follow-up
//           followUpDbFields.forEach((field) => {
//               if (updatedFollowUpData[field]) {
//                   followUpFieldsToUpdate[field] = updatedFollowUpData[field];
//               }
//           });

//           if (Object.keys(followUpFieldsToUpdate).length > 0) {
//               const updatedFollowUp = await followUpDb.findOneAndUpdate(
//                   { patient_id: patient_id },
//                   { $set: followUpFieldsToUpdate },
//                   { new: true }
//               );

//               if (!updatedFollowUp) {
//                   console.error("Failed to update followUpDb.");
//                   return new ApiResponse(500, "Error while updating follow-up details in followUpDb.", null, null);
//               }
//           }
//       }

//       // Update fields in `diagnosisDb`
//       if (diagnosisData) {
//           const diagnosisFieldsToUpdate = {};
//           const diagnosisDbFields = ["advice", "diagnosis"]; // Fields specific to diagnosis
//           diagnosisDbFields.forEach((field) => {
//               if (updatedFollowUpData[field]) {
//                   diagnosisFieldsToUpdate[field] = updatedFollowUpData[field];
//               }
//           });

//           if (Object.keys(diagnosisFieldsToUpdate).length > 0) {
//               const updatedDiagnosis = await diagnosisDb.findOneAndUpdate(
//                   { patient_id: patient_id },
//                   { $set: diagnosisFieldsToUpdate },
//                   { new: true }
//               );

//               if (!updatedDiagnosis) {
//                   console.error("Failed to update diagnosisDb.");
//                   return new ApiResponse(500, "Error while updating advice and diagnosis in diagnosisDb.", null, null);
//               }
//           }
//       }

//       return new ApiResponse(200, "Patient details updated successfully.", null, {
//           updatedPatient,
//           updatedFollowUpData,
//           updatedDiagnosisData,
//       });
//   } catch (error) {
//       console.error("Error while updating patient details:", error.message);
//       return new ApiResponse(500, "Exception while updating patient details.", null, error.message);
//   }
// }

// async function followUp(patient_id, updatedPatientData, updatedDiagnosisData, updatedSurgeryData,updatedFollowUpData) {
//     try {
//         const patientData = await patientDb.findOne({ patient_id });

//         // if (!patientData) {
//         //     return new ApiResponse(404, `No patient found with ID: ${patient_id}`, null, null);
//         // }

//         const diagnosisData = await diagnosisDb.findOne({ patient_id });

//         // if (!diagnosisData) {
//         //     return new ApiResponse(404, `No diagnosis found for patient ID: ${patient_id}`, null, null);
//         // }

//         const surgeryData = await surgeryDetailsDb.findOne({ patient_id });

//         const followUpData= await followUpDb.findOne({patient_id});

//         // if (!surgeryData) {
//         //     return new ApiResponse(404, `No surgery details found with patient ID: ${patient_id}`, null, null);
//         // }

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
//             reference: updatedPatientData?.reference || patientData.ref,
//             date:updatedPatientData?.date || patientData.date,

//             diagnosis: updatedDiagnosisData?.diagnosis || diagnosisData.diagnosis,
//             advice: updatedDiagnosisData?.advice || diagnosisData.advice,
//             present_complaints:updatedDiagnosisData?.present_complaints || diagnosisData.present_complaints,

//             plan: updatedSurgeryData?.plan || surgeryData.plan,

//             followup_id: updatedFollowUpData?.followup_id || followUpData.followup_id,

//         };

//         // Save the combined data in the followUp database
//         await followUpDb.updateOne(
//             { patient_id }, // Match patient_id
//             { $set: combinedData }, // Update with combined data
//             { upsert: true } // Insert if not already exists
//         );

//         return new ApiResponse(200, "Follow-up data updated successfully", combinedData, null);
//     } catch (error) {
//         console.error(`Error updating follow-up data for patient ID ${patient_id}:`, error.message);

//         return new ApiResponse(500, 'Follow-up database update failed.', null, error.message);
//     }
// }

module.exports = {
  followUp,
  listFollowUp,
};
