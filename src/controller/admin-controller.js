const ApiResponse = require("../utils/api-response");
const AdminService = require("../service/admin-services");

// Add a new doctor
async function addDoctor(req, res, next) {
  try {
    console.log("Controller received request to add doctor:", req.body);
    const result = await AdminService.addDoctor(req.body, req.user);
    console.log("Add Doctor Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding doctor:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(500, "Error while adding doctor.", null, error.message),
      );
  }
}

// Edit doctor details
async function editDoctor(req, res, next) {
  try {
    console.log(
      "Controller received request to edit doctor with email:",
      req.params.email,
    );
    const result = await AdminService.editDoctor(
      req.params.email,
      req.body,
      req.user,
    );
    console.log("Edit Doctor Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while editing doctor:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while editing doctor.",
          null,
          error.message,
        ),
      );
  }
}

// List all doctors
async function listDoctor(req, res, next) {
  try {
    console.log("Controller received request to list all doctors.");
    const doctors = await AdminService.listDoctor();
    console.log("List Doctors Result:", doctors);
    res
      .status(200)
      .send(
        new ApiResponse(200, "Doctors fetched successfully.", null, doctors),
      );
  } catch (error) {
    console.error("Error while fetching doctors:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching doctors.",
          null,
          error.message,
        ),
      );
  }
}

module.exports = {
  addDoctor,
  editDoctor,
  listDoctor,
};
