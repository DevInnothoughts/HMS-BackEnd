const ApiResponse = require("../utils/api-response");
const followUpService = require("../service/followUp-services.js");

async function followUp(req, res, next) {
  try {
    console.log("Request Body:", req.body);
    console.log("Patient ID:", req.params.patient_id);

    // Extract the fields to be updated from the request body
    const combinedData = req.body;

    // Call the service function to update the personal details and follow-up data
    const result = await followUpService.followUp(
      req.params.patient_id,
      combinedData,
    );

    // Send the response with the result from the service function
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while updating patient:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating patient.",
          null,
          error.message,
        ),
      );
  }
}

async function listFollowUp(req, res) {
  try {
    const { patient_id } = req.params;

    console.log(
      "Controller received request to list all followup.",
      req.params.patient_id,
    );
    const FollowUp = await followUpService.listFollowUp(req.params.patient_id);
    console.log("List followup Result:", FollowUp);
    res
      .status(200)
      .send(
        new ApiResponse(200, "followup fetched successfully.", null, FollowUp),
      );
  } catch (error) {
    console.error("Error while fetching patients:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching followup.",
          null,
          error.message,
        ),
      );
  }
}

// async function followUp(req, res, next) {
//     try {
//         console.log("Request Body:", req.body);  // Log the request body
//         console.log("Patient ID:", req.params.patient_id);  // Log the patient ID
//         const updatedPatientData = req.body.patientData;
//         const updatedDiagnosisData = req.body.diagnosisData;
//         const updatedSurgeryData = req.body.surgeryData;
//         const updatedFollowUpData = req.body.followUpdata;

//         // Call the service function with the correct data
//         const result = await followUpService.followUp(req.params.patient_id, updatedPatientData, updatedDiagnosisData,updatedSurgeryData,updatedFollowUpData);
//         res.status(result.statusCode).send(result);
//     } catch (error) {
//         console.error("Error while editing patient:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while editing patient.", null, error.message));
//     }
// }

module.exports = {
  followUp,
  listFollowUp,
};
