const ApiResponse = require("../utils/api-response");
const patientHistoryDb = require("../database/patientHistoryDb");
const medicationHistoryDb = require("../database/medicationHistoryDb");
const dischargeCardDb = require("../database/dischargeCardDb");
const patientDb = require("../database/patientDb");
const doctorDb = require("../database/doctorDb");
const prescriptionOpdDb = require("../database/prescriptionOpdDb");
const medicineDb = require("../database/medicineDb.js");
const dischargeCardDetailsDb = require("../database/dischargeCardDetailsDb.js");
const urologyDb = require("../database/urologyDb.js");
const surgeryDetailsDb = require("../database/surgeryDetailsDb");
const refDocDb = require("../database/refDocDb.js");

async function addDischargeCard(dischargeCardData, patient_id) {
  console.log("Service received request for patient ID:", patient_id);

  try {
    const dischargeCardDbExist = await dischargeCardDb.findOne({ patient_id });
    if (dischargeCardDbExist) {
      return new ApiResponse(
        400,
        "Patient already registered with the provided patient_id",
        null,
        null,
      );
    }
    //dischargecard
    const newDischargeCard = new dischargeCardDb({
      patient_id,
      DOA: dischargeCardData.DOA,
      DOD: dischargeCardData.DOD,
      DOA_time: dischargeCardData.DOA_time,
      DOD_time: dischargeCardData.DOD_time,
      investigation: dischargeCardData.investigation,
      Follow_date: dischargeCardData.Follow_date,
      madeby: dischargeCardData.madeby,
      treatingby: dischargeCardData.treatingby,
      checkedby: dischargeCardData.checkedby,
      surgeryadvice: dischargeCardData.surgeryadvice,
      consultantName: dischargeCardData.consultantName,
      IPDNo: dischargeCardData.IPDNo,
      BP: dischargeCardData.BP,
      past_history: dischargeCardData.past_history,
      allergies: dischargeCardData.allergies,
      diagnosis: dischargeCardData.diagnosis,
      local_care: dischargeCardData.local_care,
      admission_reason: dischargeCardData.admission_reason,
      findings: dischargeCardData.findings,
      carenote: dischargeCardData.carenote,
      surgical_procedure: dischargeCardData.surgical_procedure,
      prescriptionAssign: dischargeCardData.prescriptionAssign,
    });

    const dischargeCardResult = await newDischargeCard.save();
    console.log("Discharge Card successfully registered", dischargeCardResult);
    //dischargeCardDetails
    const NewDischargeCardDetailsData = new dischargeCardDetailsDb({
      patient_id,
      surgery_type: dischargeCardData.surgery_type,
    });

    const dischargeCardDetailsResult = await NewDischargeCardDetailsData.save();
    console.log(
      "Medication history successfully registered",
      dischargeCardDetailsResult,
    );
    //medicine
    const newMedicine = new medicineDb({
      patient_id,
      name: dischargeCardData.name,
      gender_type: dischargeCardData.gender_type,
      medicine_type: dischargeCardData.medicine_type,
      status: dischargeCardData.status,
      medicine_dosage: dischargeCardData.medicine_dosage,
    });

    const medicineResult = await newMedicine.save();
    console.log("Medication history successfully registered", medicineResult);

    //prescription
    const newPrescription = new prescriptionOpdDb({
      patient_id,
      prescription_type: dischargeCardData.prescription_type,
      medicine_name: dischargeCardData.medicine_name,
      medicine_quantity: dischargeCardData.medicine_quantity,
      medicine_time: dischargeCardData.medicine_time,
      medicine_days: dischargeCardData.medicine_days,
    });

    const prescriptionResult = await newPrescription.save();
    console.log(
      "Medication history successfully registered",
      prescriptionResult,
    );
    //patient
    const newPatient = new patientDb({
      patient_id,
      name: dischargeCardData.name,
      age: dischargeCardData.age,
      sex: dischargeCardData.sex,
      address: dischargeCardData.address,
    });

    const patientResult = await newPatient.save();
    console.log("Medication history successfully registered", patientResult);
    //urology
    const newUrology = new urologyDb({
      patient_id,
      spo2: dischargeCardData.spo2,
      pulse: dischargeCardData.pulse,
      RR: dischargeCardData.RR,
      temperature: dischargeCardData.temperature,
    });

    const urologyResult = await newUrology.save();
    console.log("Urology history successfully registered", urologyResult);

    //surgery
    const newSurgery = new surgeryDetailsDb({
      patient_id,
      surgery_note: dischargeCardData.surgery_note,
      surgery_remarks: dischargeCardData.surgery_remarks,
    });

    const surgeryResult = await newSurgery.save();
    console.log("Medication history successfully registered", surgeryResult);

    return new ApiResponse(
      201,
      "Patient and medication history registered successfully.",
      null,
      {
        dischargeCard: dischargeCardResult,
        dischargeCardDetails: dischargeCardDetailsResult,
        medicine: medicineResult,
        prescription: prescriptionResult,
        patient: patientResult,
        urology: urologyResult,
        surgery: surgeryResult,
      },
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
async function updateDischargeCard(patient_id, updatedDischargeCardData) {
  try {
    console.log(
      "Service received request to update discharge card for patient_id:",
      patient_id,
    );

    // Fetch existing discharge card data
    const dischargeCardData = await dischargeCardDb.findOne({ patient_id });

    if (!dischargeCardData) {
      return new ApiResponse(
        400,
        "Discharge Card Data not found for update",
        null,
        null,
      );
    }

    // Merge existing data with updated data
    const updatedData = {
      ...dischargeCardData.toObject(),
      ...updatedDischargeCardData,
    };
    delete updatedData._id; // Prevent _id updates

    // Update discharge card
    const updatedDischargeCard = await dischargeCardDb.findOneAndUpdate(
      { patient_id },
      updatedData,
      { new: true }, // Return updated document
    );

    if (!updatedDischargeCard) {
      return new ApiResponse(
        500,
        "Error while updating the discharge card.",
        null,
        null,
      );
    }

    // Update prescription
    const updatedPrescriptionOpd = await prescriptionOpdDb.findOneAndUpdate(
      { patient_id },
      {
        $set: {
          prescription_type:
            updatedDischargeCardData.prescription_type ||
            dischargeCardData.prescription_type,
          medicine_name:
            updatedDischargeCardData.medicine_name ||
            dischargeCardData.medicine_name,
          medicine_quantity:
            updatedDischargeCardData.medicine_quantity ||
            dischargeCardData.medicine_quantity,
          medicine_time:
            updatedDischargeCardData.medicine_time ||
            dischargeCardData.medicine_time,
          medicine_days:
            updatedDischargeCardData.medicine_days ||
            dischargeCardData.medicine_days,
        },
      },
      { new: true },
    );

    if (!updatedPrescriptionOpd) {
      return new ApiResponse(
        500,
        "Error while updating the prescription.",
        null,
        null,
      );
    }

    // Update patient details
    const updatedPatient = await patientDb.findOneAndUpdate(
      { patient_id },
      {
        $set: {
          name: updatedDischargeCardData.name || dischargeCardData.name,
          age: updatedDischargeCardData.age || dischargeCardData.age,
          sex: updatedDischargeCardData.sex || dischargeCardData.sex,
          address:
            updatedDischargeCardData.address || dischargeCardData.address,
        },
      },
      { new: true, upsert: false }, // Prevent creating new records
    );

    if (!updatedPatient) {
      return new ApiResponse(
        500,
        "Error while updating the patient.",
        null,
        null,
      );
    }

    // Update urology details
    const updatedUrology = await urologyDb.findOneAndUpdate(
      { patient_id },
      {
        $set: {
          spo2: updatedDischargeCardData.spo2 || dischargeCardData.spo2,
          pulse: updatedDischargeCardData.pulse || dischargeCardData.pulse,
          RR: updatedDischargeCardData.RR || dischargeCardData.RR,
          temperature:
            updatedDischargeCardData.temperature ||
            dischargeCardData.temperature,
        },
      },
      { new: true },
    );

    if (!updatedUrology) {
      return new ApiResponse(
        500,
        "Error while updating urology details.",
        null,
        null,
      );
    }

    // // Update medicine details
    // const updatedMedicine = await medicineDb.findOneAndUpdate(
    //     { patient_id },
    //     {
    //         $set: {
    //             name: updatedDischargeCardData.name || dischargeCardData.name,
    //             // gender_type: updatedDischargeCardData.gender_type || dischargeCardData.gender_type,
    //             medicine_type: updatedDischargeCardData.medicine_type || dischargeCardData.medicine_type,
    //             status: updatedDischargeCardData.status || dischargeCardData.status,
    //             medicine_dosage: updatedDischargeCardData.medicine_dosage || dischargeCardData.medicine_dosage,
    //         },
    //     },
    //     { new: true }
    // );

    // if (!updatedMedicine) {
    //     return new ApiResponse(500, "Error while updating medicine details.", null, null);
    // }

    // Update surgery details
    const updatedSurgery = await surgeryDetailsDb.findOneAndUpdate(
      { patient_id },
      {
        $set: {
          surgery_note:
            updatedDischargeCardData.surgery_note ||
            dischargeCardData.surgery_note,
        },
      },
      { new: true },
    );

    if (!updatedSurgery) {
      return new ApiResponse(
        500,
        "Error while updating surgery details.",
        null,
        null,
      );
    }

    // Update discharge card details
    const updatedDischargeCardDetails =
      await dischargeCardDetailsDb.findOneAndUpdate(
        { patient_id },
        {
          $set: {
            surgery_type:
              updatedDischargeCardData.surgery_type ||
              dischargeCardData.surgery_type,
          },
        },
        { new: true },
      );

    if (!updatedDischargeCardDetails) {
      return new ApiResponse(
        500,
        "Error while updating discharge card details.",
        null,
        null,
      );
    }

    return new ApiResponse(
      200,
      "Discharge card and related details updated successfully.",
      null,
      {
        dischargeCard: updatedDischargeCard,
        dischargeCardDetails: updatedDischargeCardDetails,
        prescriptionOpd: updatedPrescriptionOpd,
        patient: updatedPatient,
        urology: updatedUrology,
        // medicine: updatedMedicine,
        surgery: updatedSurgery,
      },
    );
  } catch (error) {
    console.error("Error while updating discharge card:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating discharge card.",
      null,
      error.message,
    );
  }
}
async function listDischargeCard(patient_id) {
  console.log(
    "Service received request to list Discharge card for patient_id:",
    patient_id,
  );

  try {
    const dischargeCardData = await dischargeCardDb.findOne({ patient_id });
    console.log("Fetched discharge card:", dischargeCardData);

    // Helper function to fetch doctor name by doctor_id
    async function getDoctorName(doctorId) {
      if (!doctorId) return null;
      const doctor = await doctorDb.findOne({ doctor_id: doctorId });
      return doctor ? doctor.name : null;
    }

    // Helper function to fetch and concatenate ref doctor details
    async function getRefDoctorName(doctorId) {
      console.log("Fetching ref doctor for ID:", doctorId); // Debug log

      if (!doctorId) return null;

      try {
        const doctor = await refDocDb.findOne({ reference_doctor_id: doctorId });
        console.log("Fetched Ref Doctor:", doctor); // Debug the returned object

        // Concatenate name and phone if the doctor exists
        return doctor
          ? `${doctor.ref_doctor_name} (${doctor.ref_doctor_phone})`
          : null;
      } catch (error) {
        console.error("Error fetching ref doctor details:", error);
        return null;
      }
    }

    // Helper function to format dates
    function formatDate(date) {
      if (!date) return null;
      const parsedDate = new Date(date);
      return `${String(parsedDate.getDate()).padStart(2, "0")}/${String(
        parsedDate.getMonth() + 1,
      ).padStart(2, "0")}/${parsedDate.getFullYear()}`;
    }

    if (dischargeCardData) {
      // Replace doctor IDs with their names
      dischargeCardData.madeby = await getDoctorName(dischargeCardData.madeby);
      dischargeCardData.treatingby = await getDoctorName(
        dischargeCardData.treatingby,
      );
      dischargeCardData.checkedby = await getDoctorName(
        dischargeCardData.checkedby,
      ); 
      dischargeCardData.consultantName = await getDoctorName(
        dischargeCardData.consultantName, 
      )
// Inside the listDischargeCard function after fetching dischargeCardData
if (dischargeCardData.prescriptionAssign) {
    const prescriptionDoctor = await doctorDb.findOne({
        doctor_id: dischargeCardData.prescriptionAssign,
    });

    dischargeCardData.prescriptionAssign = prescriptionDoctor
        ? prescriptionDoctor.name // Replace doctor_id with doctor's name
        : `Doctor not found for ID: ${dischargeCardData.prescriptionAssign}`; // Fallback in case of missing doctor
}      // Format DOA, DOD, and Follow_date in the response
      dischargeCardData.DOA = formatDate(dischargeCardData.DOA);
      dischargeCardData.DOD = formatDate(dischargeCardData.DOD);
      dischargeCardData.Follow_date = formatDate(dischargeCardData.Follow_date);
    }

    // Fetch prescription, patient, medicine, and other related data
    const prescriptionOpdData = await prescriptionOpdDb.find({ patient_id });
    const patientData = await patientDb.findOne({ patient_id });

    if (patientData) {
      // Log the ref value before conversion
      console.log("Patient ref value before conversion:", patientData.ref);

      // Convert ref to a number before passing it to getRefDoctorName
      const refDoctorId = Number(patientData.ref);

      if (isNaN(refDoctorId)) {
        console.error("Invalid ref value, cannot convert to number:", patientData.ref);
        patientData.ref = null; // Handle invalid ref values
      } else {
        patientData.ref = await getRefDoctorName(refDoctorId); // Concatenated name and phone
      }
    }

    const medicineData = await medicineDb.find({ patient_id });
    const dischargeCardDetailsData = await dischargeCardDetailsDb.find({
      patient_id,
    });
    const urologyData = await urologyDb.find({ patient_id });
    const surgeryData = await surgeryDetailsDb.find({ patient_id });

    return new ApiResponse(200, "Discharge card fetched successfully.", null, {
      dischargeCardData,
      prescriptionOpdData,
      patientData,
      medicineData,
      dischargeCardDetailsData,
      urologyData,
      surgeryData,
    });
  } catch (error) {
    console.error("Error while fetching discharge card:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching discharge card.",
      null,
      error.message,
    );
  }
}


// async function listDischargeCard(patient_id) {
//     try {
//         const dischargeCardData = await dischargeCardDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id:1,
//                     DOA: 1,
//                     DOD: 1,
//                     DOA_time: 1,
//                     DOD_time: 1,
//                     investigation: 1,
//                     Follow_date: 1,
//                     madeby: 1,
//                     treatingby: 1,
//                     checkedby: 1,
//                     surgeryadvice: 1,
//                     consultantName: 1,
//                     IPDNo: 1,
//                     BP: 1,
//                     past_history: 1,
//                     allergies: 1,
//                     diagnosis: 1,
//                     local_care: 1,
//                     admission_reason: 1,
//                     findings: 1,
//                     carenote: 1,
//                     surgical_procedure: 1,
//                 },
//             },
//         ]);

//         dischargeCardData.forEach(card => {
//             console.log('Raw DOA:', card.DOA);
//             console.log('Raw DOD:', card.DOD);
//             console.log('Raw Follow_date:', card.Follow_date);

//             // Format the date fields in dischargeCardData
//             card.DOA = convertToDate(card.DOA);
//             card.DOD = convertToDate(card.DOD);
//             card.Follow_date = convertToDate(card.Follow_date);
//         });

//         const dischargeCardDetailsData = await dischargeCardDetailsDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id: 1,
//                     surgery_type: 1,
//                 },
//             },
//         ]);

//         const medicineData = await medicineDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id: 1,
//                     name: 1,
//                     gender_type: 1,
//                     status:1,
//                     medicine_dosage: 1,
//                 },
//             },
//         ]);

//         const prescriptionOpdData = await prescriptionOpdDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id: 1,
//                     prescription_type: 1,
//                     medicine_name: 1,
//                     medicine_quantity:1,
//                     medicine_time: 1,
//                     medicine_days: 1,
//                 },
//             },
//         ]);

//         const patientData = await patientDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id: 1,
//                     name: 1,
//                     age: 1,
//                     sex:1,
//                     address: 1,
//                 },
//             },
//         ]);

//         const urologyData = await urologyDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id: 1,
//                     spo2: 1,
//                     pulse: 1,
//                     RR:1,
//                     temperature: 1,
//                 },
//             },
//         ]);

//         const surgeryData = await surgeryDetailsDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     patient_id: 1,
//                     surgery_note: 1,
//                 },
//             },
//         ]);
//         return {
//             dischargeCardData,
//             dischargeCardDetailsData,
//             medicineData,
//             prescriptionOpdData,
//             patientData,
//             urologyData,
//             surgeryData,
//         };
//     } catch (error) {
//         console.log("Error while fetching surgery details: ", error.message);
//         throw new Error("Unable to fetch surgery details.");
//     }
// }

// async function dischargeCard(patient_id, updatedDischargeCardDetailsData) {
//     try {
//       // Find the patient by patient_id
//       let patientData = await dischargeCardDb.findOne({
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
//       const payload = { ...patientData.toObject(), ...updatedDischargeCardDetailsData };

//       // Ensure we are updating the correct patient and remove any unwanted field (_id)
//       delete payload._id; // Do not update _id

//       // Update the patient record in the database
//       const combinedData = await dischargeCardDb.findOneAndUpdate(
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

// async function dischargeCard(patient_id, updatedDischargeCardData,updatedPatientData,updatedUrologyData,updatedSurgeryData,
//     updatedDischargeCardDetailsData,updatedMedicineData,
//     updatedOpd_prescriptionData) {
//     try {
//         const dischargeCardData = await dischargeCardDb.findOne({ patient_id });

//         // if (!dischargeCardData) {
//         //     return new ApiResponse(404, `No patient found with ID: ${patient_id}`, null, null);
//         // }
//         const dischargeCardDetailsData = await dischargeCardDetailsDb.findOne({ patient_id });

//         const prescriptionOpdData = await prescriptionOpdDb.findOne({ patient_id });

//         const patientData = await patientDb.findOne({ patient_id });

//         const urologyData = await urologyDb.findOne({ patient_id });

//         const surgeryData = await surgeryDetailsDb.findOne({ patient_id });

//         const medicineData= await medicineDb.findOne({patient_id});

//         // Combine and update data
//         const combinedData = {
//             patient_id,
// DOA: updatedDischargeCardData?.DOA || dischargeCardData.DOA,
// DOD: updatedDischargeCardData?.DOD || dischargeCardData.DOD,
// DOA_time: updatedDischargeCardData?.DOA_time || dischargeCardData.DOA_time,
// DOD_time: updatedDischargeCardData?.DOD_time || dischargeCardData.DOD_time,
// investigation: updatedDischargeCardData?.investigation || dischargeCardData.investigation,
// Follow_date: updatedDischargeCardData?.Follow_date || dischargeCardData.Follow_date,
// madeby: updatedDischargeCardData?.madeby || dischargeCardData.madeby,
// treatingby: updatedDischargeCardData?.treatingby || dischargeCardData.treatingby,
// checkedby: updatedDischargeCardData?.checkedby || dischargeCardData.checkedby,
// surgeryadvice: updatedDischargeCardData?.surgeryadvice || dischargeCardData.surgeryadvice,
// consultantName: updatedDischargeCardData?.consultantName || dischargeCardData.consultantName,
// IPDNo: updatedDischargeCardData?.IPDNo || dischargeCardData.IPDNo,
// BP: updatedDischargeCardData?.BP || dischargeCardData.BP,
// past_history: updatedDischargeCardData?.past_history || dischargeCardData.past_history,
// allergies: updatedDischargeCardData?.allergies || dischargeCardData.allergies,
// diagnosis: updatedDischargeCardData?.diagnosis || dischargeCardData.diagnosis,
// local_care: updatedDischargeCardData?.local_care || dischargeCardData.local_care,
// admission_reason: updatedDischargeCardData?.admission_reason || dischargeCardData.admission_reason,
// findings: updatedDischargeCardData?.findings || dischargeCardData.findings,
// carenote: updatedDischargeCardData?.carenote || dischargeCardData.carenote,
// surgical_procedure: updatedDischargeCardData?.surgical_procedure || dischargeCardData.surgical_procedure,

//             surgery_type: updatedDischargeCardDetailsData?.surgery_type || dischargeCardDetailsData.surgery_type,

//             name:updatedMedicineData?.name || medicineData.name,
//             gender_type:updatedMedicineData?.gender_type || medicineData.gender_type,
//             medicine_type:updatedMedicineData?.medicine_type || medicineData.medicine_type,
//             status:updatedMedicineData?.status || medicineData.status,
//             medicine_dosage: updatedMedicineData?.medicine_dosage || medicineData.medicine_dosage,

//             prescription_type:updatedOpd_prescriptionData?.prescription_type || prescriptionOpdData.prescription_type,
//             medicine_name:updatedOpd_prescriptionData?.medicine_name || prescriptionOpdData.medicine_name,
//             medicine_quantity:updatedOpd_prescriptionData?.medicine_quantity || prescriptionOpdData.medicine_quantity,
//             medicine_time:updatedOpd_prescriptionData?.medicine_time || prescriptionOpdData.medicine_time,
//             medicine_days:updatedOpd_prescriptionData?.medicine_days || prescriptionOpdData.medicine_days,

//             patientName: updatedPatientData?.patientName || patientData.name,
//             age: updatedPatientData?.age || patientData.age,
//             sex: updatedPatientData?.sex || patientData.sex,
//             address: updatedPatientData?.address || patientData.address,

//             spo2:updatedUrologyData?.spo2 || urologyData.spo2,
//             pulse:updatedUrologyData?.pulse || urologyData.pulse,
//             RR:updatedUrologyData?.RR || urologyData.RR,
//             temperature:updatedUrologyData?.temperature || urologyData.temperature,

//             surgery_note:updatedSurgeryData?.surgery_note || surgeryData.surgery_note,
//         };

//         // Save the combined data in the followUp database
//         await dischargeCardDb.updateOne(
//             { patient_id }, // Match patient_id
//             { $set: combinedData }, // Update with combined data
//             { upsert: true } // Insert if not already exists
//         );

//         return new ApiResponse(200, "Discharge card details data updated successfully", combinedData, null);
//     } catch (error) {
//         console.error(`Error updating Discharge card details data for patient ID ${patient_id}:`, error.message);

//         return new ApiResponse(500, 'Discharge card details database update failed.', null, error.message);
//     }
// }

module.exports = {
  addDischargeCard,
  updateDischargeCard,
  listDischargeCard,
};
