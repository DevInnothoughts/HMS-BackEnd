const ApiResponse = require("../utils/api-response");
const surgeryDetailsDb = require("../database/surgeryDetailsDb");
const patientDb = require("../database/patientDb");
const diagnosisDb = require("../database/diagnosisDb");
const doctorDb = require("../database/doctorDb");

async function addSurgeryDetails(surgeryDetailsData, patient_id) {
  console.log("Service received request for patient ID:", patient_id);

  try {
    // Check if the patient already exists in patientHistoryDb using patient_id
    const surgeryDetailsDbExist = await surgeryDetailsDb.findOne({
      patient_id,
    });
    if (surgeryDetailsDbExist) {
      return new ApiResponse(
        400,
        "Patient already registered with the provided patient_id",
        null,
        null,
      );
    }

    const doctor = await doctorDb.findOne({
      name: surgeryDetailsData.assistanceDoctor,
    });

    const newSurgeryDetails = new surgeryDetailsDb({
      patient_id,
      plan: surgeryDetailsData.plan,
      admission_date: surgeryDetailsData.admission_date,
      surgery_date: surgeryDetailsData.surgery_date,
      risk_consent: surgeryDetailsData.risk_consent,
      anesthesia: surgeryDetailsData.anesthesia,
      additional_comment: surgeryDetailsData.additional_comment,
      assistanceDoctor: doctor.doctor_id,
      anaesthetist: surgeryDetailsData.anaesthetist,
      plan: surgeryDetailsData.plan,
      surgery_remarks: surgeryDetailsData.surgery_remarks,
    });

    const surgeryDetailsResult = await newSurgeryDetails.save();
    console.log(
      "Patient surgeryDetails successfully registered",
      surgeryDetailsResult,
    );

    return new ApiResponse(
      201,
      "surgeryDetails history registered successfully.",
      null,
      { surgeryDetails: surgeryDetailsResult },
    );
  } catch (error) {
    console.error("Error while registering patient: ", error.message);
    return new ApiResponse(
      500,
      "Exception while patient registration.",
      null,
      error.message,
    );
  }
}

async function updateSurgeryDetails(patient_id, updatedSurgeryDetailsData) {
  try {
    console.log(
      "Service received request to update surgeryDetails for patient_id:",
      patient_id,
    );

    let surgeryDetailsData = await surgeryDetailsDb.findOne({ patient_id });

    if (!surgeryDetailsData) {
      return new ApiResponse(
        400,
        "Patient surgeryDetails not found for update",
        null,
        null,
      );
    }

    // Fetch the doctor_id for the assistanceDoctor if the name is provided in updated data
    let assistanceDoctorId = surgeryDetailsData.assistanceDoctor;
    if (updatedSurgeryDetailsData.assistanceDoctor) {
      const doctor = await doctorDb.findOne({
        name: updatedSurgeryDetailsData.assistanceDoctor,
      });

      if (!doctor) {
        return new ApiResponse(
          404,
          `Doctor with name ${updatedSurgeryDetailsData.assistanceDoctor} not found`,
          null,
          null,
        );
      }

      assistanceDoctorId = doctor.doctor_id;
    }

    // Prepare the updated data
    const updatedData = {
      ...surgeryDetailsData.toObject(),
      ...updatedSurgeryDetailsData,
      assistanceDoctor: assistanceDoctorId,
    };

    delete updatedData._id; // Do not update _id

    const updatedSurgeryDetails = await surgeryDetailsDb.findOneAndUpdate(
      { patient_id }, // Find the patient by their unique ID
      updatedData,
      { new: true }, // Return the updated document
    );

    if (!updatedSurgeryDetails) {
      return new ApiResponse(
        500,
        "Error while updating the patient surgeryDetails.",
        null,
        null,
      );
    }

    // Return the updated data response
    return new ApiResponse(200, "surgeryDetails updated successfully.", null, {
      surgeryDetails: updatedSurgeryDetails,
    });
  } catch (error) {
    console.error("Error while updating surgeryDetails:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating surgeryDetails.",
      null,
      error.message,
    );
  }
}

async function listSurgeryDetails(patient_id) {
  console.log(
    "Service received request to list surgeryDetails for patient_id:",
    patient_id,
  );

  try {
    const surgeryDetails = await surgeryDetailsDb.findOne({ patient_id });

    async function getDoctorName(doctorId) {
      if (!doctorId) return null;
      const doctor = await doctorDb.findOne({ doctor_id: doctorId });
      return doctor ? doctor.name : null;
    }

    if (surgeryDetails) {
      surgeryDetails.assistanceDoctor = await getDoctorName(
        surgeryDetails.assistanceDoctor,
      );
    }
    // Log the fetched data for debugging
    console.log("Fetched patient surgeryDetails:", surgeryDetails);

    if (!surgeryDetails) {
      return new ApiResponse(
        404,
        "Patient surgeryDetails not found for the provided patient_id",
        null,
        null,
      );
    }

    return new ApiResponse(
      200,
      "Patient surgeryDetails fetched successfully.",
      null,
      { surgeryDetails },
    );
  } catch (error) {
    console.error(
      "Error while fetching patient surgeryDetails:",
      error.message,
    );
    return new ApiResponse(
      500,
      "Exception while fetching patient surgeryDetails.",
      null,
      error.message,
    );
  }
}

async function listAllSurgeryDetails() {
  console.log("Service received request to list surgeries for all patients.");

  try {
    const surgeries = await surgeryDetailsDb.find(
      { consent: "Yes" },
      {
        patient_id: 1,
        admission_date: 1,
        surgery_date: 1,
        assistanceDoctor: 1,
        plan: 1,
        opd_feedback: 1,
      },
    );

    if (!surgeries?.length) {
      return new ApiResponse(404, "No surgery data found.", null, null);
    }

    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const results = await Promise.all(
      surgeries.map(async (surgery) => {
        if (surgery.assistanceDoctor) {
          const assistanceDoctor = await doctorDb.findOne(
            { doctor_id: surgery.assistanceDoctor },
            { name: 1 },
          );
          surgery.assistanceDoctor = assistanceDoctor?.name || null;
        }

        return {
          ...surgery._doc,
          admission_date: formatDate(surgery.admission_date),
          surgery_date: formatDate(surgery.surgery_date),
          patientDetail: await patientDb.findOne(
            { patient_id: surgery.patient_id },
            {
              prefix: 1,
              name: 1,
              age: 1,
              sex: 1,
              phone: 1,
              mobile_2: 1,
              ref: 1,
              occupation: 1,
              address: 1,
            },
          ),
        };
      }),
    );

    console.log("Fetched surgeries with patient details:", results);

    return new ApiResponse(
      200,
      "Surgeries fetched successfully.",
      null,
      results,
    );
  } catch (error) {
    console.error("Error while fetching surgeries:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching surgeries.",
      null,
      error.message,
    );
  }
}

async function addPatientComment(patient_id, commentData) {
  console.log(
    "Service received request to update patient comment for patient_id:",
    patient_id,
  );

  try {
    // Find the existing diagnosis entry and update the comment field
    const surgeryResult = await surgeryDetailsDb.findOneAndUpdate(
      { patient_id: Number(patient_id) }, // Query to find the record
      { $set: { opd_feedback: commentData.opd_feedback } }, // Update operation
      { new: true, upsert: false }, // Return the updated document; don't create a new one
    );

    if (!surgeryResult) {
      console.error("No record found for the given patient_id:", patient_id);
      return new ApiResponse(
        404,
        "No surgery record found for the given patient_id.",
        null,
        null,
      );
    }

    console.log("Patient comment updated successfully:", surgeryResult);

    return new ApiResponse(
      200,
      "patient comment updated successfully.",
      null,
      surgeryResult,
    );
  } catch (error) {
    console.error("Error while updating patient comment:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating patient comment.",
      null,
      error.message,
    );
  }
}

// async function listSurgeryDetails(patient_id) {
//     try {
//         const surgeryDetailsData = await surgeryDetailsDb.aggregate([
//             { $match: { patient_id: String(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id:1,
//                     plan: 1,
//                     admission_date: 1,
//                     surgery_date: 1,
//                     risk_consent: 1,
//                     anesthesia: 1,
//                     additional_comment: 1,
//                     assistanceDoctor: 1,
//                     anaesthetist: 1,
//                     plan_diagnosis: 1,

//                 },
//             },
//         ]);

//         surgeryDetailsData.forEach(surgeryDetailsData=>{
//             surgeryDetailsData.admission_date=convertToDate(surgeryDetailsData.admission_date);
//             surgeryDetailsData.surgery_date=convertToDate(surgeryDetailsData.prescription_date);

//        });
//         return {
//             surgeryDetailsData,
//         };
//     } catch (error) {
//         console.log("Error while fetching surgery details: ", error.message);
//         throw new Error("Unable to fetch surgery details.");
//     }
// }

// async function surgeryDetails(patient_id, updatedSurgeryDetailsData) {
//     try {
//       // Find the patient by patient_id
//       let patientData = await surgeryDetailsDb.findOne({
//         patient_id: String(patient_id) // Ensure consistency in the field name
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
//       const payload = { ...patientData.toObject(), ...updatedSurgeryDetailsData };

//       // Ensure we are updating the correct patient and remove any unwanted field (_id)
//       delete payload._id; // Do not update _id

//       // Update the patient record in the database
//       const combinedData = await surgeryDetailsDb.findOneAndUpdate(
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

// async function surgeryDetails(patient_id, updatedSurgeryDetailsData) {
//     try {
//         const surgeryDetailsData = await surgeryDetailsDb.findOne({ patient_id });

//         // if (!surgeryDetailsData) {
//         //     return new ApiResponse(404, `No patient found with ID: ${patient_id}`, null, null);
//         // }

//         // Combine and update data
//         const combinedData = {
//             patient_id,
//             plan: updatedSurgeryDetailsData?.plan || surgeryDetailsData.plan,
//             admission_date: updatedSurgeryDetailsData?.admission_date || surgeryDetailsData.admission_date,
//             surgery_date: updatedSurgeryDetailsData?.surgery_date || surgeryDetailsData.surgery_date,
//             risk_consent: updatedSurgeryDetailsData?.risk_consent || surgeryDetailsData.risk_consent,
//             anesthesia: updatedSurgeryDetailsData?.anesthesia || surgeryDetailsData.anesthesia,
//             additional_comment: updatedSurgeryDetailsData?.additional_comment || surgeryDetailsData.additional_comment,
//             assistanceDoctor: updatedSurgeryDetailsData?.assistanceDoctor || surgeryDetailsData.assistanceDoctor,
//             anaesthetist: updatedSurgeryDetailsData?.anaesthetist || surgeryDetailsData.anaesthetist,
//             plan_diagnosis: updatedSurgeryDetailsData?.plan_diagnosis || surgeryDetailsData.plan_diagnosis,
//         };

//         // Save the combined data in the followUp database
//         await surgeryDetailsDb.updateOne(
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

module.exports = {
  addSurgeryDetails,
  updateSurgeryDetails,
  listSurgeryDetails,
  listAllSurgeryDetails,
  addPatientComment,
};
