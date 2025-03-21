const ApiResponse = require("../utils/api-response");
const ReceptionistService = require("../service/receptionist-services.js");

// Add a new receptionist
async function addReceptionist(req, res, next) {
  try {
    console.log("Controller received request to add receptionist:", req.body);
    const result = await ReceptionistService.addReceptionist(
      req.body,
      req.user,
    );
    console.log("Add Receptionist Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding recptionist:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding receptionist.",
          null,
          error.message,
        ),
      );
  }
}

module.exports = {
  addReceptionist,
};
