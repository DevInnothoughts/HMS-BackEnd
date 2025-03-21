const ApiResponse = require("../utils/api-response");
const USER_ROLE = require("../constants/role-constant");
const UserDb = require("../database/userDb");
const HospitalDb = require("../database/hospitalDb");

async function addHospital(hospital, user) {
  console.log("Service received request ", hospital);

  try {
    // Check if an hospital with the same hospital Name already exists
    const existingHospital = await HospitalDb.findOne({
      Name: hospital.Name,
      Location: hospital.Location,
    });
    if (existingHospital) {
      return new ApiResponse(
        400,
        "Hospital already exists for the provided hospital name at this location",
        null,
        null,
      );
    }

    // Create a new hospital instance
    const hospitalDb = new HospitalDb({
      Name: `${hospital.Name}`,
      Location: `${hospital.Location}`,
    });

    // Save the hospital to the database
    const result = await hospitalDb.save();
    console.log("Hospital successfully registered", result);
    return new ApiResponse(
      201,
      "Hospital registered successfully.",
      null,
      result,
    );
  } catch (error) {
    console.log("Error while registering hospital: ", error.message);
    return new ApiResponse(
      500,
      "Exception while hospital registration.",
      null,
      error.message,
    );
  }
}

async function listHospital() {
  try {
    const hospital = await HospitalDb.find();
    return hospital;
  } catch (error) {
    console.log("Error while fetching hospitals: ", error.message);
    throw new Error("Unable to fetch hospitals.");
  }
}

module.exports = { addHospital, listHospital };
