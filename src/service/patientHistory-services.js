const ApiResponse = require("../utils/api-response");
const patientHistoryDb = require("../database/patientHistoryDb");
const medicationHistoryDb = require("../database/medicationHistoryDb");
const dischargeCardDb = require("../database/dischargeCardDb");
const prescriptionAdviceDb = require("../database/prescriptionAdviceDb");
const appointmentDb = require("../database/appointmentDb");
const doctorDb = require("../database/doctorDb");
const mongoose = require("mongoose");

// Update history check
async function updateHistoryChk(patient_id) {
  try {
    console.log("Service received request to update historyChk:", patient_id);

    // Validate if `patient_id` is provided
    if (!patient_id) {
      console.warn("Invalid patient_id received:", patient_id);
      return new ApiResponse(400, "Invalid patient_id.", null, null);
    }

    // Find the appointment associated with the provided `patient_id`
    const appointment = await appointmentDb.findOne({
      patient_id: String(patient_id),
    });

    // Handle missing appointment
    if (!appointment) {
      console.warn("Appointment not found for history update:", patient_id);
      return new ApiResponse(404, "Appointment not found.", null, null);
    }

    // Update the `historychk` field in the appointment
    const updateResult = await appointmentDb.updateOne(
      { patient_id: appointment.patient_id },
      { $set: { historychk: 3 } },
    );

    // Verify if the update was successful
    if (updateResult.modifiedCount === 0) {
      console.error("Failed to update historyChk for patient_id:", patient_id);
      return new ApiResponse(
        500,
        "Error while updating historyChk.",
        null,
        null,
      );
    }

    // Fetch the updated appointment document
    const updatedAppointment = await appointmentDb.findOne({
      patient_id: appointment.patient_id,
    });

    console.log("historyChk successfully updated for patient_id:", patient_id);
    return new ApiResponse(
      200,
      "History flag updated successfully.",
      updatedAppointment,
      null,
    );
  } catch (error) {
    console.error("Error while updating historyChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

async function addPatientHistory(patientData, patient_id) {
  console.log("Service received request for patient ID:", patient_id);

  try {
    // Check if the patient already exists in patientHistoryDb using patient_id
    // const patientDbExist = await patientHistoryDb.findOne({ patient_id });
    // if (patientDbExist) {
    //   return new ApiResponse(
    //     400,
    //     "Patient already registered with the provided patient_id",
    //     null,
    //     null,
    //   );
    // }
   const doctor = await doctorDb.findOne({ name: patientData.name });

let doctor_id = null; // Default value if no doctor is found

if (doctor) {
  doctor_id = doctor.doctor_id;
  console.log("Doctor found:", doctor);
} else {
  console.warn("No doctor found for name:", patientData.name);
}


    // Create a new patient history record
    const newPatientHistory = new patientHistoryDb({
      patient_id,
      doctor_id,
      patient_date: patientData.patient_date,
      height: patientData.height,
      weight: patientData.weight,
      painscale: patientData.painscale,
      BP: patientData.BP,
      Pulse: patientData.Pulse,
      RR: patientData.RR,
      RS: patientData.RS,
      CVS: patientData.CVS,
      CNS: patientData.CNS,
      PA: patientData.PA,
      family_history: patientData.family_history,
      general_history: patientData.general_history,
      past_history: patientData.past_history,
      habits: patientData.habits,
      drugs_allery: patientData.drugs_allery,
      complaints: patientData.complaints,
      presentcomplaints: patientData.presentcomplaints,
      ongoing_medicines: patientData.ongoing_medicines,
      investigation: patientData.investigation,
      knowncaseof: patientData.knowncaseof,
      diagnosis: patientData.diagnosis,
      symptoms: patientData.symptoms,
      medical_mx: patientData.medical_mx,
      comment: patientData.comment,
      piles_duration: patientData.piles_duration,
      fistula_duration: patientData.fistula_duration,
      varicose_duration: patientData.varicose_duration,
      Urinary_incontinence_duration: patientData.Urinary_incontinence_duration,
      Fecal_incontinence_duration: patientData.Fecal_incontinence_duration,
      hernia_duration: patientData.hernia_duration,
      ODS_duration: patientData.ODS_duration,
      pilonidalsinus: patientData.pilonidalsinus,
      circumcision: patientData.circumcision,

    });

    // Save the patient history record
    const patientHistoryResult = await newPatientHistory.save();
    console.log(
      "Patient history successfully registered",
      patientHistoryResult,
    );

    // Create and save medication history
    const newMedicationHistory = new medicationHistoryDb({
      patient_id,
      medicine: patientData.medicine,
      indication: patientData.indication,
      since: patientData.since,
    });
    const medicationHistoryResult = await newMedicationHistory.save();
    console.log(
      "Medication history successfully registered",
      medicationHistoryResult,
    );

    // Create and save surgical history
    const newSurgicalHistory = new dischargeCardDb({
      patient_id,
      surgical_history: patientData.surgical_history,
    });
    const surgicalHistoryResult = await newSurgicalHistory.save();
    console.log(
      "Surgical history successfully registered",
      surgicalHistoryResult,
    );

    // Update `historychk` in `appointmentDb` for the given appointment ID
    const updateResult = await appointmentDb.updateOne(
      { patient_id },
      { $set: { historychk: 3 } },
    );

    if (updateResult.modifiedCount === 0) {
      console.warn(
        "Failed to update historyChk in appointmentDb for patient_id:",
        patient_id,
      );
      return new ApiResponse(
        500,
        "Error while updating historyChk.",
        null,
        null,
      );
    }

    console.log("historyChk successfully updated for appointment:", patient_id);

    // Return a successful response with saved history records
    return new ApiResponse(
      201,
      "Patient, medication, and surgical history registered successfully. historyChk updated.",
      null,
      {
        patientHistory: patientHistoryResult,
        medicationHistory: medicationHistoryResult,
        surgicalHistory: surgicalHistoryResult,
      },
    );
  } catch (error) {
    console.error("Error while registering patient history:", error.message);
    return new ApiResponse(
      500,
      "Exception while registering patient history.",
      null,
      error.message,
    );
  }
}

async function updatePatientHistory(patient_id, updatedPatientHistoryData) {
  try {
    console.log(
      "Service received request to update or create PatientHistory for patient_id:",
      patient_id,
    );

    // Find the patient history by patient_id
    let patientHistoryData = await patientHistoryDb.findOne({ patient_id });

    let doctor_id = null;

    // Check if the doctor's name has been provided
    if (updatedPatientHistoryData.name) {
      const doctor = await doctorDb.findOne({
        name: updatedPatientHistoryData.name,
      });

      if (doctor) {
        doctor_id = doctor.doctor_id;
        console.log("Doctor found:", doctor);
      } else {
        console.warn(`Doctor with name ${updatedPatientHistoryData.name} not found.`);
      }
    }

    if (patientHistoryData) {
      // Update existing patient history
      const updatedData = {
        ...patientHistoryData.toObject(),
        ...updatedPatientHistoryData,
        doctor_id: doctor_id || patientHistoryData.doctor_id, // Use the updated or existing doctor_id
      };

      delete updatedData._id; // Ensure `_id` is not modified

      const updatedPatientHistory = await patientHistoryDb.findOneAndUpdate(
        { patient_id },
        updatedData,
        { new: true }, // Return the updated document
      );

      if (!updatedPatientHistory) {
        return new ApiResponse(
          500,
          "Error while updating the patient history.",
          null,
          null,
        );
      }

      // Update medication history
      await medicationHistoryDb.findOneAndUpdate(
        { patient_id },
        {
          $set: {
            medicine:
              updatedPatientHistoryData.medicine || patientHistoryData.medicine,
            indication:
              updatedPatientHistoryData.indication ||
              patientHistoryData.indication,
            since: updatedPatientHistoryData.since || patientHistoryData.since,
          },
        },
        { new: true },
      );

      // Update discharge card (surgical history)
      await dischargeCardDb.findOneAndUpdate(
        { patient_id },
        {
          $set: {
            surgical_history:
              updatedPatientHistoryData.surgical_history ||
              patientHistoryData.surgical_history,
          },
        },
        { new: true },
      );

      console.log("Patient history and related data updated successfully.");
      return new ApiResponse(
        200,
        "Patient history updated successfully.",
        null,
        updatedPatientHistory,
      );
    } else {
      // Create a new patient history record if not found
      const newPatientHistory = new patientHistoryDb({
        patient_id,
        doctor_id,
        ...updatedPatientHistoryData,
      });

      const patientHistoryResult = await newPatientHistory.save();

      // Create medication history
      const newMedicationHistory = new medicationHistoryDb({
        patient_id,
        medicine: updatedPatientHistoryData.medicine,
        indication: updatedPatientHistoryData.indication,
        since: updatedPatientHistoryData.since,
      });
      await newMedicationHistory.save();

      // Create discharge card (surgical history)
      const newSurgicalHistory = new dischargeCardDb({
        patient_id,
        surgical_history: updatedPatientHistoryData.surgical_history,
      });
      await newSurgicalHistory.save();

      console.log("Patient history and related data created successfully.");
      return new ApiResponse(
        201,
        "Patient history created successfully.",
        null,
        patientHistoryResult,
      );
    }
  } catch (error) {
    console.error("Error while updating or creating PatientHistory:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating or creating PatientHistory.",
      null,
      error.message,
    );
  }
}



async function listPatientHistory(patient_id) {
  console.log(
    "Service received request to list patient for patient_id:",
    patient_id,
  );

  try {
    // Fetch patient history from patientHistoryDb using patient_id
    const patientHistory = await patientHistoryDb.findOne({ patient_id });

    // Log the fetched data for debugging
    console.log("Fetched patient history:", patientHistory);

    // Check if patient history exists
    if (!patientHistory) {
      return new ApiResponse(
        404,
        "Patient history not found for the provided patient_id",
        null,
        null,
      );
    }

    // Fetch medication history from medicationHistoryDb using patient_id
    const medicationHistory = await medicationHistoryDb.find({ patient_id });

    // Log the fetched medication history for debugging
    console.log("Fetched medication history:", medicationHistory);

    // Fetch surgical history from dischargeCardDb using patient_id
    const surgicalHistory = await dischargeCardDb.find({ patient_id });

    // Log the fetched surgical history for debugging
    console.log("Fetched surgical history:", surgicalHistory);

    // Fetch doctor information from doctorDb using doctor_id from patientHistory
    const doctor_id = patientHistory.doctor_id; // Assuming doctor_id is a field in patientHistory
    const doctorInfo = await doctorDb.findOne({ doctor_id });

    // Log the fetched doctor information for debugging
    console.log("Fetched doctor information:", doctorInfo);

    // Prepare the response data
    const responseData = {
      patientHistory,
      medicationHistory,
      surgicalHistory,
      doctor: doctorInfo ? { name: doctorInfo.name, id: doctorInfo._id } : null, // Include doctor name and id
    };

    // Return the successful response with both patient and medication history
    return new ApiResponse(
      200,
      "Patient and medication history fetched successfully.",
      null,
      responseData,
    );
  } catch (error) {
    console.error("Error while fetching patient history:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching patient history.",
      null,
      error.message,
    );
  }
}


// async function patientHistory(patient_id, updatedPatientHistoryData, updatedMedicationHistoryData,updatedDischargeCardData,UpdatedPrescriptionAdviceData) {
//     try {
//         const patientHistoryData = await patientHistoryDb.findOne({ patient_id });

//         // if (!patientHistoryData) {
//         //     return new ApiResponse(404, `No patient history found with ID: ${patient_id}`, null, null);
//         // }

//         const medicationHistoryData = await medicationHistoryDb.findOne({ patient_id });

//         // if (!medicationHistoryData) {
//         //     return new ApiResponse(404, `No medication history found for patient ID: ${patient_id}`, null, null);
//         // }
//         const dischargeCardData= await dischargeCardDb.findOne({patient_id});

//         const prescriptionAdviceData= await prescriptionAdviceDb.findOne({patient_id});
//         // Combine and update data

//         const combinedData = {
//             patient_id,
//             patient_date: updatedPatientHistoryData?.patient_date || patientHistoryData.patient_date,
//             height: updatedPatientHistoryData?.height || patientHistoryData.height,
//             weight: updatedPatientHistoryData?.weight || patientHistoryData.weight,
//             painscale: updatedPatientHistoryData?.painscale || patientHistoryData.painscale,
//             BP: updatedPatientHistoryData?.BP || patientHistoryData.BP,
//             Pulse: updatedPatientHistoryData?.Pulse || patientHistoryData.Pulse,
//             RR: updatedPatientHistoryData?.RR || patientHistoryData.RR,
//             RS: updatedPatientHistoryData?.RS || patientHistoryData.RS,
//             CVS: updatedPatientHistoryData?.CVS || patientHistoryData.CVS,
//             CNS: updatedPatientHistoryData?.CNS || patientHistoryData.CNS,
//             PA: updatedPatientHistoryData?.PA || patientHistoryData.PA,
//             family_history: updatedPatientHistoryData?.family_history || patientHistoryData.family_history,
//             general_history: updatedPatientHistoryData?.general_history || patientHistoryData.general_history,
//             past_history: updatedPatientHistoryData?.past_history || patientHistoryData.past_history,
//             habits: updatedPatientHistoryData?.habits || patientHistoryData.habits,
//             drugs_allery: updatedPatientHistoryData?.drugs_allery || patientHistoryData.drugs_allery,
//             complaints: updatedPatientHistoryData?.complaints || patientHistoryData.complaints,
//             presentcomplaints: updatedPatientHistoryData?.presentcomplaints || patientHistoryData.presentcomplaints,
//             ongoing_medicines: updatedPatientHistoryData?.ongoing_medicines || patientHistoryData.ongoing_medicines,
//             investigation: updatedPatientHistoryData?.investigation || patientHistoryData.investigation,
//             knowncaseof: updatedPatientHistoryData?.knowncaseof || patientHistoryData.knowncaseof,
//             diagnosis: updatedPatientHistoryData?.diagnosis || patientHistoryData.diagnosis,
//             symptoms: updatedPatientHistoryData?.symptoms || patientHistoryData.symptoms,

//             medicine: updatedMedicationHistoryData?.medicine || medicationHistoryData.medicine,
//             indication:updatedMedicationHistoryData?.indication || medicationHistoryData.indication,
//             since:updatedMedicationHistoryData?.since || medicationHistoryData.since,

//             surgical_history:updatedDischargeCardData?.surgical_history || dischargeCardData.surgical_history,

//             padvice_desc:UpdatedPrescriptionAdviceData?.padvice_desc || prescriptionAdviceData.padvice_desc,
//         };

//         // Save the combined data in the followUp database
//         await patientHistoryDb.updateOne(
//             { patient_id }, // Match patient_id
//             { $set: combinedData }, // Update with combined data
//             { upsert: true } // Insert if not already exists
//         );

//         return new ApiResponse(200, "patient history updated successfully", combinedData, null);
//     } catch (error) {
//         console.error(`Error updating patient history for patient ID ${patient_id}:`, error.message);

//         return new ApiResponse(500, 'Patient history database update failed.', null, error.message);
//     }
// }

module.exports = {
  addPatientHistory,
  updatePatientHistory,
  listPatientHistory,
  updateHistoryChk,
};
