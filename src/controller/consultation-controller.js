const ApiResponse = require("../utils/api-response");
const ConsultationService = require("../service/consultation-services.js");

// Add a new consultation
async function addConsultation(req, res, next) {
  try {
    console.log("Controller received request to add consultation:", req.body);
    const result = await ConsultationService.addConsultation(
      req.body,
      req.user,
    );
    console.log("Add Consultation Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding consultation:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding consultation.",
          null,
          error.message,
        ),
      );
  }
}

module.exports = {
  addConsultation,
};
