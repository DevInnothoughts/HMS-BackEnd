const ApiResponse = require("../utils/api-response");
const otherTestsDb = require("../database/otherTestsDb");
const labTestDb = require("../database/labTestDb");
const doctorDb = require("../database/doctorDb");

async function addOtherTests(otherTestsData, patient_id) {
  console.log("Service received request for patient ID:", patient_id);

  try {
    const otherTestsDbExist = await otherTestsDb.findOne({ patient_id });
    if (otherTestsDbExist) {
      return new ApiResponse(
        400,
        "Patient already registered with the provided patient_id",
        null,
        null,
      );
    }

    // Split test_type into individual test names
    const testNames = otherTestsData.test_type
      .split(",")
      .map((name) => name.trim());

    // Fetch test IDs for the provided test names
    const tests = await labTestDb
      .find({ test_name: { $in: testNames } })
      .select("test_id test_name");

    // Check if all test names are found
    const foundTestNames = tests.map((test) => test.test_name);
    const missingTests = testNames.filter(
      (name) => !foundTestNames.includes(name),
    );
    if (missingTests.length > 0) {
      return new ApiResponse(
        404,
        `Test with name(s) "${missingTests.join(", ")}" not found.`,
        null,
        null,
      );
    }

    // Extract test IDs
    const testIds = tests.map((test) => test.test_id);

    // Fetch doctor_id for the ref_doctor name
    const doctor = await doctorDb.findOne({ name: otherTestsData.ref_doctor });
    // if (!doctor) {
    //   return new ApiResponse(
    //     404,
    //     `Doctor with name "${otherTestsData.ref_doctor}" not found.`,
    //     null,
    //     null,
    //   );
    // }

    // Create a new patient history record
    const newOtherTestsDb = new otherTestsDb({
      patient_id,
      test_date: otherTestsData.test_date,
      test_type: testIds.join(","), // Store test IDs as a comma-separated string
      ref_doctor: doctor.doctor_id, // Store doctor_id
      fee_status: otherTestsData.fee_status,
      visit_type: otherTestsData.visit_type,
      test_comment: otherTestsData.test_comment,
    });

    const otherTestsResult = await newOtherTestsDb.save();
    console.log(
      "Patient other tests successfully registered",
      otherTestsResult,
    );
    return new ApiResponse(
      201,
      "Patient other tests registered successfully.",
      null,
      { otherTests: otherTestsResult },
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

async function updateOtherTests(patient_id, updatedOtherTestsData) {
  try {
    console.log(
      "Service received request to update other tests for patient_id:",
      patient_id,
    );

    let otherTestsData = await otherTestsDb.findOne({ patient_id });

    if (!otherTestsData) {
      return new ApiResponse(
        400,
        "Patient other tests not found for update",
        null,
        null,
      );
    }

    const updatedData = {
      ...otherTestsData.toObject(),
      ...updatedOtherTestsData,
    };

    delete updatedData._id; // Do not update _id

    const updatedOtherTests = await otherTestsDb.findOneAndUpdate(
      { patient_id }, // Find the patient by their unique ID
      updatedData,
      { new: true }, // Return the updated document
    );

    if (!updatedOtherTests) {
      return new ApiResponse(
        500,
        "Error while updating the patient other tests.",
        null,
        null,
      );
    }

    // Return the updated data response
    return new ApiResponse(200, "other tests updated successfully.", null, {
      otherTests: updatedOtherTestsData,
    });
  } catch (error) {
    console.error("Error while updating other tests:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating other tests.",
      null,
      error.message,
    );
  }
}
async function listOtherTests(patient_id) {
  console.log(
    "Service received request to list other tests for patient_id:",
    patient_id,
  );

  try {
    const otherTests = await otherTestsDb.findOne({
      patient_id,
      fee_status: { $in: [true, false] },
    });

    console.log("Fetched patient other tests:", otherTests);

    async function getDoctorName(doctorId) {
      if (!doctorId) return null;
      const doctor = await doctorDb.findOne({ doctor_id: doctorId });
      return doctor ? doctor.name : null;
    }

    if (otherTests) {
      otherTests.ref_doctor = await getDoctorName(otherTests.ref_doctor);
    }

    if (!otherTests) {
      return new ApiResponse(
        404,
        "Patient other tests not found for the provided patient_id",
        null,
        null,
      );
    }

    // Ensure test_type is processed correctly
    let testIds = otherTests.test_type;

    // Split the comma-separated string into an array
    if (typeof testIds === "string") {
      testIds = testIds.split(","); // Split into an array of strings
    }

    if (!Array.isArray(testIds) || testIds.length === 0) {
      return new ApiResponse(
        404,
        "No test IDs found in test_type field",
        null,
        null,
      );
    }

    // Convert each string in the array to a number
    const numericTestIds = testIds.map((testId) => Number(testId));

    // Check if the conversion was successful
    if (numericTestIds.some(isNaN)) {
      return new ApiResponse(
        400,
        "One or more test_ids are invalid and cannot be converted to numbers",
        null,
        null,
      );
    }

    // Fetch test details from labTestsDb
    const testDetails = await labTestDb
      .find({ test_id: { $in: numericTestIds } })
      .select("test_name test_code");

    console.log("Fetched test details from labTestDb:", testDetails);

    if (!testDetails || testDetails.length === 0) {
      return new ApiResponse(
        404,
        "No test details found for the provided test IDs",
        null,
        null,
      );
    }

    const response = {
      patient_id: Number(patient_id),
      otherTests,
      testDetails,
    };

    return new ApiResponse(
      200,
      "Other tests fetched successfully.",
      null,
      response,
    );
  } catch (error) {
    console.error("Error while fetching patient other tests:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching patient other tests.",
      null,
      error.message,
    );
  }
}

// async function otherTests(patient_id,updatedOtherTestsData) {
//     try {
//         // Query the database for a patient with the given ID
//         const otherTestsData = await otherTestsDb.findOne({ patient_id });

//         // Check if the patient was found
//         // if (!patientData) {
//         //     // Return a structured error message or response instead of throwing an error directly
//         //     return new ApiResponse(404, `No patient found with ID: ${patient_id}`, null, null);
//         // }
//         const combinedData = {
//             patient_id,
//             test_date: updatedOtherTestsData?.test_date || otherTestsData.test_date,
//             test_type: updatedOtherTestsData?.test_type || otherTestsData.test_type,
//             ref_doctor: updatedOtherTestsData?.ref_doctor || otherTestsData.ref_doctor,
//             fee_status: updatedOtherTestsData?.fee_status || otherTestsData.fee_status,
//             visit_type: updatedOtherTestsData?.visit_type || otherTestsData.visit_type,
//             test_comment: updatedOtherTestsData?.test_comment || otherTestsData.test_comment,
//             test_response: updatedOtherTestsData?.test_response || otherTestsData.test_response,
//             receipt_status: updatedOtherTestsData?.receipt_status || otherTestsData.receipt_status,
//         };

//         await otherTestsDb.updateOne(
//             { patient_id }, // Match patient_id
//             { $set: combinedData }, // Update with combined data
//             { upsert: true } // Insert if not already exists
//         );
//         // Return a structured response with statusCode and patient data
//         return new ApiResponse(200, "Patient tests fetched successfully", combinedData, null);
//     } catch (error) {
//         console.error(`Error fetching patient data for ID ${patient_id}:`, error.message);

//         // Return a structured error message for the client while logging the full error
//         return new ApiResponse(500, 'Database query failed.', null, error.message);
//     }
// }

// async function listOtherTests(patient_id) {
//     try {
//         const otherTestsData = await otherTestsDb.aggregate([
//             { $match: { patient_id: Number(patient_id) } }, // Match the patient by patient_id
//             {
//                 $project: {
//                     _id: 1,
//                     test_date: 1,
//                     test_type: 1,
//                     ref_doctor: 1,
//                     fee_status: 1,
//                     visit_type: 1,
//                     test_comment: 1,
//                     test_response: 1,
//                     receipt_status: 1,
//                 },
//             },
//         ]);

//         otherTestsData.forEach(otherTestsData=>{
//             otherTestsData.test_date=convertToDate(otherTestsData.test_date);
//        });

//         return {
//             otherTestsData,
//         };
//     } catch (error) {
//         console.log("Error while fetching other tests: ", error.message);
//         throw new Error("Unable to fetch other tests.");
//     }
// }
// async function otherTests(patient_id, updatedOtherTestsData) {
//     try {
//       // Find the patient by patient_id
//       let patientData = await otherTestsDb.findOne({
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
//       const payload = { ...patientData.toObject(), ...updatedOtherTestsData };

//       // Ensure we are updating the correct patient and remove any unwanted field (_id)
//       delete payload._id; // Do not update _id

//       // Update the patient record in the database
//       const combinedData = await otherTestsDb.findOneAndUpdate(
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
  addOtherTests,
  updateOtherTests,
  listOtherTests,
};
