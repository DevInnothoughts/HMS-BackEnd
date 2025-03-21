const ApiResponse = require("../utils/api-response");
const USER_ROLE = require("../constants/role-constant");
const UserDb = require("../database/userDb");
const ReceptionistDb = require("../database/receptionistDb.js");

async function addReceptionist(receptionist, user) {
  console.log("Service received request ", receptionist);

  // Check if receptionist with the given email already exists
  const receptionistDbExist = await ReceptionistDb.findOne({
    Email: receptionist.Email,
  });
  if (receptionistDbExist) {
    return new ApiResponse(
      400,
      "Receptionist is already registered with the provided email",
      null,
      null,
    );
  }

  try {
    // Create a new receptionist instance
    const receptionistDb = new ReceptionistDb({
      Name: `${receptionist.Name}`,
      Location: `${receptionist.Location}`,
      Email: `${receptionist.Email}`,
      Password: `${receptionist.Password}`,
      Address: `${receptionist.Address}`,
      Phone: `${receptionist.Phone}`,
    });

    // Save the receptionist to the database
    const result = await receptionistDb.save();
    console.log("Receptionist successfully registered", result);
    return new ApiResponse(
      201,
      "Receptionist registered successfully.",
      null,
      result,
    );
  } catch (error) {
    console.log("Error while registering receptionist: ", error.message);
    return new ApiResponse(
      500,
      "Exception while receptionist registration.",
      null,
      error.message,
    );
  }
}

module.exports = { addReceptionist };
