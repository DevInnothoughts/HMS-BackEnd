const ApiResponse = require("../utils/api-response");
const PatientsService = require("../service/Patients-services.js");

// List all patients
async function listPatient(req, res, next) {
  try {
    console.log("Controller received request to list all patients.");
    const patient = await PatientsService.listPatient();
    console.log("List Patient Result:", patient);
    res
      .status(200)
      .send(
        new ApiResponse(200, "Patients fetched successfully.", null, patient),
      );
  } catch (error) {
    console.error("Error while fetching patients:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patients.",
          null,
          error.message,
        ),
      );
  }
}

async function listRefPatient(req, res) {
  try {
    const { phone } = req.params;

    console.log(
      "Controller received request to list ref patient data for phone:",
      phone,
    );

    const result = await PatientsService.listRefPatient(phone);
    console.log("Get ref patient data Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching patient data:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patient data.",
          null,
          error.message,
        ),
      );
  }
}

async function listDoctor(req, res, next) {
  try {
    console.log("Controller received request to list all doctor.");
    const doctor = await PatientsService.listDoctor();
    console.log("List doctor Result:", doctor);
    res
      .status(200)
      .send(new ApiResponse(200, "doctor fetched successfully.", null, doctor));
  } catch (error) {
    console.error("Error while fetching doctor:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching doctor.",
          null,
          error.message,
        ),
      );
  }
}
module.exports = {
  listPatient,
  listDoctor,
  listRefPatient,
};
