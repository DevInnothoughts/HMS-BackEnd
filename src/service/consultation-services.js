const ApiResponse = require("../utils/api-response");
const USER_ROLE = require("../constants/role-constant");
const UserDb = require("../database/userDb");
const ConsultationDb = require("../database/consultationDb.js");

async function addConsultation(consultation, user) {
  console.log("Service received request ", consultation);

  // Check if Consultation with the given name already exists
  const consultationDbExist = await ConsultationDb.findOne({
    Name: consultation.Name,
  });
  if (consultationDbExist) {
    return new ApiResponse(
      400,
      "consultation is already registered with the provided name",
      null,
      null,
    );
  }

  try {
    // Create a new consultation instance
    const consultationDb = new ConsultationDb({
      consultation_id: `${consultation.consultation_id}`,
      consultation_name: `${consultation.consultation_name}`,
    });

    // Save the Consultation to the database
    const result = await consultationDb.save();
    console.log("Consultation successfully registered", result);
    return new ApiResponse(
      201,
      "Consultation registered successfully.",
      null,
      result,
    );
  } catch (error) {
    console.log("Error while registering Consultation: ", error.message);
    return new ApiResponse(
      500,
      "Exception while Consultation registration.",
      null,
      error.message,
    );
  }
}

module.exports = { addConsultation };
