const ApiResponse = require("../utils/api-response");
const patientHistoryService = require("../service/patientHistory-services.js");

// Update historyChk flag when history button is clicked
async function updateHistoryChk(req, res) {
  try {
    const { patient_id } = req.params;
    console.log(
      "Controller received request to update historyChk:",
      patient_id,
    );
    if (!patient_id)
      return res
        .status(400)
        .send(new ApiResponse(400, "patient ID is required.", null, null));
    const result = await patientHistoryService.updateHistoryChk(patient_id);
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while updating historyChk:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating historyChk.",
          null,
          error.message,
        ),
      );
  }
}
async function addPatientHistory(req, res) {
  try {
    const { patient_id } = req.params;
    const patientData = req.body;

    console.log(
      "Controller received request to add PatientHistory:",
      patientData,
    );
    console.log("Extracted patient_id from URL:", patient_id);

    const result = await patientHistoryService.addPatientHistory(
      patientData,
      patient_id,
    );
    console.log("Add PatientHistory Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding PatientHistory:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding PatientHistory.",
          null,
          error.message,
        ),
      );
  }
}
async function updatePatientHistory(req, res) {
  const { patient_id } = req.params;
  const updatedPatientHistoryData = req.body;

  try {
    const response = await patientHistoryService.updatePatientHistory(
      patient_id,
      updatedPatientHistoryData,
    );

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          "patient history data fetched successfully.",
          null,
          updatedPatientHistoryData,
        ),
      );
  } catch (error) {
    console.error("Error in updatePatientHistoryController:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating patient history.",
          null,
          error.message,
        ),
      );
  }
}

async function listPatientHistory(req, res) {
  try {
    const { patient_id } = req.params;

    console.log(
      "Controller received request to list patient for patient_id:",
      patient_id,
    );

    const result = await patientHistoryService.listPatientHistory(patient_id);
    console.log("Get PatientHistory Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching patient history:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patient history.",
          null,
          error.message,
        ),
      );
  }
}

module.exports = {
  addPatientHistory,
  updatePatientHistory,
  listPatientHistory,
  updateHistoryChk,
};
