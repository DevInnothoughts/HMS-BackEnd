const ApiResponse = require("../utils/api-response");
const patienttabsService = require("../service/patienttabs-services.js");

async function personal(req, res, next) {
  try {
    console.log("Controller received :", req.params.patient_id);
    const result = await patienttabsService.personal(req.params.patient_id);
    console.log("Controller Result:", result);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error while listing personal details:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while listing personal details.",
          null,
          error.message,
        ),
      );
  }
}
async function editPersonal(req, res, next) {
  try {
    // Log the request body and patient ID
    console.log("Request Body:", req.body);
    console.log("Patient ID:", req.params.patient_id);

    // Extract the fields to be updated from the request body
    const updatedData = req.body;

    // Call the service function to update the personal details
    const result = await patienttabsService.editPersonal(
      req.params.patient_id,
      updatedData,
    );

    // Send the response with the result from the service function
    res.status(result.statusCode).send(result);
  } catch (error) {
    // Log any errors and send a failure response
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

module.exports = {
  personal,
  editPersonal,
};
