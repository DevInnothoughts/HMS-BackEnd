const ApiResponse = require("../utils/api-response");
const HospitalService = require("../service/hospital-services");

// Add a new hospital
async function addHospital(req, res, next) {
  try {
    console.log("Controller received request to add hospital:", req.body);
    const result = await HospitalService.addHospital(req.body, req.user);
    console.log("Add Hospital Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding hospital:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding hospital.",
          null,
          error.message,
        ),
      );
  }
}

async function listHospital(req, res, next) {
  try {
    console.log("Controller received request to list all hospitals.");
    const hospitals = await HospitalService.listHospital();
    console.log("List hospital Result:", hospitals);
    res
      .status(200)
      .send(
        new ApiResponse(
          200,
          "Hospitals fetched successfully.",
          null,
          hospitals,
        ),
      );
  } catch (error) {
    console.error("Error while fetching hospitals:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching hospitals.",
          null,
          error.message,
        ),
      );
  }
}

module.exports = {
  addHospital,
  listHospital,
};
