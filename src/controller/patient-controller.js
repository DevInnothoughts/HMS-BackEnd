const ApiResponse = require("../utils/api-response");
const PatientService = require("../service/patient-services");

// Add a new patient
async function addPatient(req, res, next) {
  try {
    console.log("Controller received request to add patient:", req.body);
    const result = await PatientService.addPatient(req.body, req.user);
    console.log("Add Patient Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding patient:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(500, "Error while adding patient.", null, error.message)
      );
  }
}

// Edit an existing patient
async function editPatient(req, res, next) {
  try {
    console.log(
      "Controller received request to edit patient with phone number:",
      req.params.patient_id
    );
    const result = await PatientService.editPatient(
      req.query.patient_id,
      req.body,
      req.user,
      req.query.location
    );
    console.log("Edit Patient Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while editing patient:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while editing patient.",
          null,
          error.message
        )
      );
  }
}

// List all patients
async function listPatient(req, res, next) {
  try {
    console.log("Controller received request to list all patients.");
    const patients = await PatientService.listPatient(req);
    //console.log("List Patient Result:", patients);
    res
      .status(200)
      .send(
        new ApiResponse(200, "Patients fetched successfully.", null, patients)
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
          error.message
        )
      );
  }
}

module.exports = {
  addPatient,
  editPatient,
  listPatient,
};
