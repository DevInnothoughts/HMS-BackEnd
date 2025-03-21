const ApiResponse = require("../utils/api-response");
const patientDb = require("../database/patientDb");
const refDocDb = require("../database/refDocDb");

function formatDateToDDMMYYYY(date) {
  if (!date) return null; // If the date is not provided
  const isoDate = new Date(date); // Convert ISO string to Date object
  if (isNaN(isoDate)) return null; // Return null if it's an invalid date
  const day = String(isoDate.getDate()).padStart(2, "0"); // Get day and ensure it's two digits
  const month = String(isoDate.getMonth() + 1).padStart(2, "0"); // Get month (0-indexed, so add 1)
  const year = isoDate.getFullYear(); // Get year
  return `${day}/${month}/${year}`; // Format as dd/mm/yyyy
}

// List Patients Function
async function listPatient() {
  try {
    const patients = await patientDb.aggregate([
      { $sort: { _id: -1 } },
      // {
      //   $match: {
      //     patient_id: { $gte: 98168, $lte: 104040 }, // Match records within the range
      //   },
      // },
      // { $sort: { patient_id: -1 } }, // Sort by patient_id in descending order
      // { $limit: 5000 },      
      {
        $project: {
          _id: 1,
          patient_id: 1,
          Uid_no: 1,
          name: 1,
          phone: 1,
          age: 1,
          sex: 1,
          email: 1,
          address: 1,
          date: 1,
          patient_type: 1,
        },
      },
    ]);

    // Format the date for each patient
    return patients.map((patient) => ({
      ...patient,
      date: formatDateToDDMMYYYY(patient.date), // Format date field
    }));
  } catch (error) {
    console.error("Error while fetching patients: ", error.message);
    throw new Error("Unable to fetch patients.");
  }
}

async function listDoctor() {
  try {
    const doctor = await refDocDb.aggregate([
      // { $limit: 500 },
      {
        $project: {
          _id: 1,
          ref_doctor_name: 1,
          ref_doctor_phone: 1,
          reference_doctor_speciality: 1,
          reference_doctor_location: 1,
          reference_doctor_id: 1,
        },
      },
    ]);
    return doctor;
  } catch (error) {
    console.log("Error while fetching doctor: ", error.message);
    throw new Error("Unable to fetch doctor.");
  }
}

async function listRefPatient(phone) {
  console.log("Service received request to list ref patient for phone:", phone);

  try {
    // Use projection to fetch only the name and pincode fields
    const refPatientData = await patientDb.findOne(
      { phone },
      { name: 1, pincode: 1, phone: 1, patient_id: 1, _id: 0 }, // Projection: include name and pincode, exclude _id
    );
    console.log("Fetched ref patient:", refPatientData);

    return new ApiResponse(200, "Ref patient fetched successfully.", null, {
      refPatientData,
    });
  } catch (error) {
    console.error("Error while fetching ref patient:", error.message);
    return new ApiResponse(
      500,
      "Exception while fetching ref patient.",
      null,
      error.message,
    );
  }
}

module.exports = {
  listPatient,
  listDoctor,
  listRefPatient,
};
