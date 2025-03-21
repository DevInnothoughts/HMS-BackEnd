const ApiResponse = require("../utils/api-response");
const diagnosisDb = require("../database/diagnosisDb");
const surgicalAdviceDb = require("../database/surgicalAdviceDb");
const doctorDb = require("../database/doctorDb");
const patientDb = require("../database/patientDb");
const patientHistoryDb = require("../database/patientHistoryDb");

async function addDiagnosis(patient_id, diagnosisData) {
  console.log("Service received request for patient ID:", patient_id);
  if (!patient_id || isNaN(Number(patient_id))) {
    return new ApiResponse(400, "Invalid patient_id provided.", null, null);
  }
  try {
    const diagnosisDbExist = await diagnosisDb.findOne({
      patient_id: Number(patient_id),
    });
    if (diagnosisDbExist) {
      return new ApiResponse(
        400,
        "Patient already registered with the provided patient_id",
        null,
        null,
      );
    }
    let consultantDoctorId = null;
    if (diagnosisData.consultantDoctor) {
      const consultantDoctor = await doctorDb.findOne({
        name: diagnosisData.consultantDoctor,
      });
      if (!consultantDoctor) {
        return new ApiResponse(
          404,
          `Consultant doctor with name ${diagnosisData.consultantDoctor} not found`,
          null,
          null
        );
      }
      consultantDoctorId = consultantDoctor.doctor_id;
    }

    // Fetch `doctor_id` for assistanceDoctor
    let assistanceDoctorId = null;
    if (diagnosisData.assistanceDoctor) {
      const assistanceDoctor = await doctorDb.findOne({
        name: diagnosisData.assistanceDoctor,
      });
      if (!assistanceDoctor) {
        return new ApiResponse(
          404,
          `Assistance doctor with name ${diagnosisData.assistanceDoctor} not found`,
          null,
          null
        );
      }
      assistanceDoctorId = assistanceDoctor.doctor_id;
    }

    //dischargecard
    const newDiagnosis = new diagnosisDb({
      patient_id,
      diagnosis: diagnosisData.diagnosis,
      advice: diagnosisData.advice,
      date_diagnosis: diagnosisData.date_diagnosis,
      investigationorders: diagnosisData.investigationorders,
      provisionaldiagnosis: diagnosisData.provisionaldiagnosis,
      comment: diagnosisData.comment,
      adviceComment: diagnosisData.adviceComment,
      RF: diagnosisData.RF,
      Laser: diagnosisData.Laser,
      MW: diagnosisData.MW,
      categoryComment: diagnosisData.categoryComment,
      insurance: diagnosisData.insurance,
      insuranceCompany: diagnosisData.insuranceCompany,
      workshop: diagnosisData.workshop,
      consultantDoctor: consultantDoctorId,
      assistanceDoctor: assistanceDoctorId,
      SurgicalDate: diagnosisData.SurgicalDate,
      diagnosisAdvice: diagnosisData.diagnosisAdvice,
      medicines: diagnosisData.medicines,
      other: diagnosisData.other,
      speciality: diagnosisData.speciality,
      symptoms: diagnosisData.symptoms,
    });

    const diagnosisResult = await newDiagnosis.save();
    console.log("diagnosis successfully registered", diagnosisResult);
    //dischargeCardDetails
    const NewsurgicalAdviceData = new surgicalAdviceDb({
      patient_id,
      surgical_advice_desc: diagnosisData.surgical_advice_desc,
    });

    const surgicalAdviceResult = await NewsurgicalAdviceData.save();
    console.log(
      "surgical advice successfully registered",
      surgicalAdviceResult,
    );

    return new ApiResponse(201, "diagnosis registered successfully.", null, {
      diagnosis: diagnosisResult,
      SurgicalAdvice: surgicalAdviceResult,
    });
  } catch (error) {
    console.error("Error while registering patient diagnosis: ", error.message);
    return new ApiResponse(
      500,
      "Exception while patient diagnosis registration.",
      null,
      error.message,
    );
  }
}
const updateDiagnosis = async (patient_id, updatedDiagnosisData) => {
  try {
    console.log("Service: Updating diagnosis for patient_id:", patient_id);

    // Fetch the existing diagnosis data
    const diagnosisData = await diagnosisDb.findOne({ patient_id });
    if (!diagnosisData) {
      return new ApiResponse(
        400,
        "Diagnosis data not found for update",
        null,
        null,
      );
    }

    // Merge existing data with the updated data while avoiding overwriting `_id`
    const updatedData = {
      ...diagnosisData.toObject(),
      ...updatedDiagnosisData,
    };
    delete updatedData._id;

    // Update the diagnosis in the database
    const updatedDiagnosis = await diagnosisDb.findOneAndUpdate(
      { patient_id },
      updatedData,
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

    // Update the surgical advice
    const updatedSurgicalAdvice = await surgicalAdviceDb.findOneAndUpdate(
      { patient_id },
      {
        $set: {
          surgical_advice_desc:
            updatedDiagnosisData.surgical_advice_desc ??
            diagnosisData.surgical_advice_desc,
        },
      },
      { new: true },
    );

    return new ApiResponse(
      200,
      "Diagnosis and surgical advice updated successfully.",
      null,
      {
        diagnosis: updatedDiagnosis,
        surgicalAdvice: updatedSurgicalAdvice,
      },
    );
  } catch (error) {
    console.error("Service: Error while updating diagnosis:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating diagnosis.",
      null,
      error.message,
    );
  }
};

async function listDiagnosis(patient_id) {
  console.log(
    "Service received request to list diagnosis for patient_id:",
    patient_id,
  );

  try {
    // Fetch the diagnosis data
    const diagnosisData = await diagnosisDb.find({ patient_id });
    if (!diagnosisData) {
      return new ApiResponse(
        404,
        "No diagnosis data found for the provided patient_id.",
        null,
        null,
      );
    }

    // Fetch doctor names for consultantDoctor and assistanceDoctor
    const enrichedDiagnosisData = await Promise.all(
      diagnosisData.map(async (diagnosis) => {
        if (diagnosis.consultantDoctor) {
          const consultantDoctor = await doctorDb.findOne({
            doctor_id: diagnosis.consultantDoctor,
          });
          diagnosis.consultantDoctor = consultantDoctor?.name || "Unknown";
        }
        if (diagnosis.assistanceDoctor) {
          const assistanceDoctor = await doctorDb.findOne({
            doctor_id: diagnosis.assistanceDoctor,
          });
          diagnosis.assistanceDoctor = assistanceDoctor?.name || "Unknown";
        }
        return diagnosis;
      }),
    );

    // Fetch the surgical advice data
    const surgicalAdviceData = await surgicalAdviceDb.find({ patient_id });
    console.log("Fetched surgical advice:", surgicalAdviceData);

    return new ApiResponse(200, "diagnosis fetched successfully.", null, {
      diagnosisData: enrichedDiagnosisData,
      surgicalAdviceData,
    });
  } catch (error) {
    console.error("Error while fetching diagnosis:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching diagnosis.",
      null,
      error.message,
    );
  }
}


async function listAllDiagnosis() {
  console.log("Service received request to list diagnoses for all patients.");

  try {
    const confirmedPatients = await patientDb.find(
      { ConfirmPatient: 1 },
      { patient_id: 1 },
    );

    const confirmedPatientIds = confirmedPatients.map((p) => p.patient_id);

    if (!confirmedPatientIds.length) {
      return new ApiResponse(404, "No confirmed patients found.", null, null);
    }

    // Fetch diagnoses for confirmed patients
    const diagnoses = await diagnosisDb
      .find(
        { patient_id: { $in: confirmedPatientIds } },
        {
          patient_id: 1,
          date_diagnosis: 1,
          diagnosis: 1,
          diagnosisAdvice: 1,
          adviceComment: 1,
          consultantDoctor: 1,
          assistanceDoctor: 1,
          comment: 1,
        },
      )
      .sort({ _id: -1 })
      .limit(500);

    if (!diagnoses?.length) {
      return new ApiResponse(
        404,
        "No diagnosis data found for confirmed patients.",
        null,
        null,
      );
    }

    // Fetch associated patient details and history
    const results = await Promise.all(
      diagnoses.map(async (diagnosis) => {
        if (
          diagnosis.consultantDoctor &&
          !isNaN(Number(diagnosis.consultantDoctor))
        ) {
          const consultantDoctor = await doctorDb.findOne(
            { doctor_id: Number(diagnosis.consultantDoctor) },
            { name: 1 },
          );
          diagnosis.consultantDoctor = consultantDoctor?.name || " ";
        } else {
          diagnosis.consultantDoctor = " "; // Set empty space if invalid
        }

        if (
          diagnosis.assistanceDoctor &&
          !isNaN(Number(diagnosis.assistanceDoctor))
        ) {
          const assistanceDoctor = await doctorDb.findOne(
            { doctor_id: Number(diagnosis.assistanceDoctor) },
            { name: 1 },
          );
          diagnosis.assistanceDoctor = assistanceDoctor?.name || " ";
        } else {
          diagnosis.assistanceDoctor = " "; // Set empty space if invalid
        }

        return {
          ...diagnosis._doc,
          patientDetail: await patientDb.findOne(
            { patient_id: diagnosis.patient_id },
            {
              patient_id: 1,
              prefix: 1,
              Uid_no: 1,
              name: 1,
              age: 1,
              sex: 1,
              phone: 1,
              ref: 1,
              address: 1,
              ConfirmPatient: 1,
            },
          ),
          patientHistoryDetail: await patientHistoryDb.findOne(
            { patient_id: diagnosis.patient_id },
            { past_history: 1 },
          ),
        };
      }),
    );

    console.log(
      "Fetched diagnoses with patient details for confirmed patients:",
      results,
    );

    return new ApiResponse(
      200,
      "Diagnoses fetched successfully.",
      null,
      results,
    );
  } catch (error) {
    console.error("Error while fetching diagnoses:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching diagnoses.",
      null,
      error.message,
    );
  }
}

async function addDoctorComment(patient_id, commentData) {
  console.log(
    "Service received request to update doctor comment for patient_id:",
    patient_id,
  );

  try {
    // Find the existing diagnosis entry and update the comment field
    const diagnosisResult = await diagnosisDb.findOneAndUpdate(
      { patient_id: Number(patient_id) }, // Query to find the record
      { $set: { feedback: commentData.feedback } }, // Update operation
      { new: true, upsert: false }, // Return the updated document; don't create a new one
    );

    if (!diagnosisResult) {
      console.error("No record found for the given patient_id:", patient_id);
      return new ApiResponse(
        404,
        "No diagnosis record found for the given patient_id.",
        null,
        null,
      );
    }

    console.log("Doctor comment updated successfully:", diagnosisResult);

    return new ApiResponse(
      200,
      "Doctor comment updated successfully.",
      null,
      diagnosisResult,
    );
  } catch (error) {
    console.error("Error while updating doctor comment:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating doctor comment.",
      null,
      error.message,
    );
  }
}

// async function diagnosis(patient_id, updatedDiagnosisData,updatedSurgicalAdviceData) {
//     try {
//         const diagnosisData = await diagnosisDb.findOne({ patient_id });

//         // if (!diagnosisData) {
//         //     return new ApiResponse(404, `No diagnosis found with ID: ${patient_id}`, null, null);
//         // }
//         const surgicalAdviceData = await surgicalAdviceDb.findOne({ patient_id });

//         // Combine and update data
//         const combinedData = {
//             patient_id,
//             diagnosis: updatedDiagnosisData?.diagnosis || diagnosisData.diagnosis,
//             advice: updatedDiagnosisData?.advice || diagnosisData.advice,
//             date_diagnosis: updatedDiagnosisData?.date_diagnosis || diagnosisData.date_diagnosis,
//             investigationorders: updatedDiagnosisData?.investigationorders || diagnosisData.investigationorders,
//             provisionaldiagnosis: updatedDiagnosisData?.provisionaldiagnosis || diagnosisData.provisionaldiagnosis,
//             comment: updatedDiagnosisData?.comment || diagnosisData.comment,
//             adviceComment: updatedDiagnosisData?.adviceComment || diagnosisData.adviceComment,
//             RF: updatedDiagnosisData?.RF || diagnosisData.RF,
//             Laser: updatedDiagnosisData?.Laser || diagnosisData.Laser,
//             MW: updatedDiagnosisData?.MW || diagnosisData.MW,
//             categoryComment: updatedDiagnosisData?.categoryComment || diagnosisData.categoryComment,
//             insurance: updatedDiagnosisData?.insurance || diagnosisData.insurance,
//             insuranceCompany: updatedDiagnosisData?.insuranceCompany || diagnosisData.insuranceCompany,
//             workshop: updatedDiagnosisData?.workshop || diagnosisData.workshop,
//             consultantDoctor: updatedDiagnosisData?.consultantDoctor || diagnosisData.consultantDoctor,
//             assistanceDoctor: updatedDiagnosisData?.assistanceDoctor || diagnosisData.assistanceDoctor,
//             SurgicalDate: updatedDiagnosisData?.SurgicalDate || diagnosisData.SurgicalDate,
//             diagnosisAdvice: updatedDiagnosisData?.diagnosisAdvice || diagnosisData.diagnosisAdvice,
//             medicines:updatedDiagnosisData?.medicines ||diagnosisData.medicines,
//             other:updatedDiagnosisData?.other || diagnosisData.other,
//             speciality:updatedDiagnosisData?.speciality || diagnosisData.speciality,
//             symptoms:updatedDiagnosisData?.symptoms || diagnosisData.symptoms,

//             surgical_advice_desc:updatedSurgicalAdviceData?.surgical_advice_desc || surgicalAdviceData.surgical_advice_desc,
//         };

//         // Save the combined data in the followUp database
//         await diagnosisDb.updateOne(
//             { patient_id }, // Match patient_id
//             { $set: combinedData }, // Update with combined data
//             { upsert: true } // Insert if not already exists
//         );

//         return new ApiResponse(200, "diagnosis data updated successfully", combinedData, null);
//     } catch (error) {
//         console.error(`Error updating diagnosis data for patient ID ${patient_id}:`, error.message);

//         return new ApiResponse(500, 'diagnosis database update failed.', null, error.message);
//     }
// }

// async function listDiagnosis(patient_id) {
//     try {
//         // Fetch patient history with aggregation
//         const diagnosisData = await diagnosisDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     diagnosis: 1,
//                     advice: 1,
//                     date_diagnosis: 1,
//                     investigationorders: 1,
//                     provisionaldiagnosis: 1,
//                     comment: 1,
//                     adviceComment: 1,
//                     RF: 1,
//                     Laser: 1,
//                     MW:1,
//                     categoryComment: 1,
//                     insurance: 1,
//                     insuranceCompany: 1,
//                     workshop: 1,
//                     consultantDoctor: 1,
//                     assistanceDoctor: 1,
//                     SurgicalDate:1,
//                     diagnosisAdvice: 1,
//                     medicines: 1,
//                     other: 1,
//                     speciality: 1,
//                     symptoms: 1,
//                 },
//             },
//         ]);

//         diagnosisData.forEach(diagnosisData=>{
//             diagnosisData.date_diagnosis=convertToDate(diagnosisData.date_diagnosis);
//             diagnosisData.SurgicalDate=convertToDate(diagnosisData.SurgicalDate);
//         });

//         // Fetch medication history with aggregation
//         const surgicalAdviceData = await surgicalAdviceDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id: 1,
//                     surgical_advice_desc: 1,
//                 },
//             },
//         ]);

//         // Combine patient history and medication history
//         return {
//             diagnosisData,
//             surgicalAdviceData,
//         };
//     } catch (error) {
//         console.log("Error while fetching patient history or medication history: ", error.message);
//         throw new Error("Unable to fetch patient or medication history.");
//     }
// }
// async function diagnosis(patient_id, updatedDiagnosisData) {
//     try {
//       // Find the patient by patient_id
//       let diagnosisData = await diagnosisDb.findOne({
//         patient_id: patient_id // Ensure consistency in the field name
//       });

//       // If no patient is found, return an error response
//       if (!diagnosisData) {
//         return new ApiResponse(
//           400,
//           "Patient not found for update",
//           null,
//           null
//         );
//       }

//       // Merge the provided updated data with the existing patient data
//       const payload = { ...diagnosisData.toObject(), ...updatedDiagnosisData };

//       // Ensure we are updating the correct patient and remove any unwanted field (_id)
//       delete payload._id; // Do not update _id

//       // Update the patient record in the database
//       const combinedData = await diagnosisDb.findOneAndUpdate(
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

module.exports = {
  addDiagnosis,
  updateDiagnosis,
  listDiagnosis,
  listAllDiagnosis,
  addDoctorComment,
};
