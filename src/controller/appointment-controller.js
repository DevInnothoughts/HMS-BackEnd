const ApiResponse = require("../utils/api-response");
const AppointmentService = require("../service/appointment-services");

// Add a new appointment
async function addAppointment(req, res, next) {
  try {
    console.log(
      "Controller received request to add appointment:",
      req.body.phone
    );
    const result = await AppointmentService.addAppointment(req.body, req.user);
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding appointment:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding appointment.",
          null,
          error.message
        )
      );
  }
}
// Define the formatPhoneNumber function
function formatPhoneNumber(phoneNumber) {
  if (phoneNumber && typeof phoneNumber === "string") {
    return phoneNumber.replace(/\D/g, ""); // Remove non-digit characters
  }
  return ""; // Return empty string if invalid
}

// Your editAppointment function
async function editAppointment(req, res, next) {
  try {
    console.log("Incoming request to edit appointment");

    const patient_phone =
      req.params.patient_phone ||
      req.query.patient_phone ||
      req.body.patient_phone;

    if (!patient_phone) {
      console.log(" Error: Phone number is missing or invalid");
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "Phone number is required",
            null,
            "Phone number is missing or invalid"
          )
        );
    }

    const formattedPhone = formatPhoneNumber(patient_phone);

    // Check if the phone number is valid after formatting
    if (!formattedPhone) {
      console.log(" Error: Invalid phone number format");
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "Phone number format is invalid",
            null,
            "Invalid phone number format"
          )
        );
    }

    console.log(
      "🔹 Calling AppointmentService.editAppointment for phone number:",
      formattedPhone
    );

    // Assuming the rest of your code is correct
    const result = await AppointmentService.editAppointment(
      formattedPhone,
      req.body,
      req.user
    );

    console.log("✅ Appointment updated successfully:", result);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("❌ Error while editing appointment:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Error while editing appointment.",
          null,
          error.message
        )
      );
  }
}

// // List all appointments
// async function listAppointments(req, res, next) {
//     try {
//         console.log("Controller received request to list all appointments.");
//         console.log("Received Query Params:", req.query); // Debugging

//         // Pass req.query instead of undefined queryParams
//         const appointments = await AppointmentService.listAppointments(req.query);

//         console.log("✅ List Appointments result:", appointments.length, "records found.");
//         res.status(200).send(new ApiResponse(200, "Appointment list fetched successfully", null, appointments));
//     } catch (error) {
//         console.error("❌ Error while fetching appointments:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while fetching appointments.", null, error.message));
//     }
// }

async function listAppointments(req, res, next) {
  try {
    console.log("Controller received request to list all appointments.");
    console.log("Raw Query Params:", req.query); // Debugging

    // Ensure `from` and `to` are correctly extracted
    const { from, to, location } = req.query;

    if (!from || !to) {
      console.error("❌ Error: Missing 'from' or 'to' date in query params.");
      return res
        .status(400)
        .send(
          new ApiResponse(
            400,
            "Missing 'from' or 'to' date in query params.",
            null,
            null
          )
        );
    }

    // Call service with correctly extracted params
    const appointments = await AppointmentService.listAppointments({
      from,
      to,
      location,
    });

    console.log(
      "✅ List Appointments result:",
      appointments.length,
      "records found."
    );
    res
      .status(200)
      .send(
        new ApiResponse(
          200,
          "Appointment list fetched successfully",
          null,
          appointments
        )
      );
  } catch (error) {
    console.error("❌ Error while fetching appointments:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching appointments.",
          null,
          error.message
        )
      );
  }
}

// Confirm an appointment
async function confirmAppointment(req, res) {
  try {
    const { appId, location } = req.query;
    console.log("Controller received request to confirm appointment:", appId);
    if (!appId)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
    const result = await AppointmentService.confirmAppointment(appId, location);
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while confirming appointment:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while confirming appointment.",
          null,
          error.message
        )
      );
  }
}

// Fetch doctor dropdown
async function doctorDropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch doctor dropdown");
    const data = await AppointmentService.doctorDropdown(req.query.location);
    return res
      .status(data.length ? 200 : 404)
      .send(
        new ApiResponse(
          200,
          "Doctor dropdown fetched successfully.",
          null,
          data
        )
      );
  } catch (error) {
    console.error("Error while fetching doctor dropdown:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching doctor dropdown.",
          null,
          error.message
        )
      );
  }
}

// Fetch consultation dropdown
async function consultationDropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch consultation dropdown");
    const data = await AppointmentService.consultationDropdown();
    return res
      .status(data.length ? 200 : 404)
      .send(
        new ApiResponse(
          200,
          "Consultation dropdown fetched successfully.",
          null,
          data
        )
      );
  } catch (error) {
    console.error("Error while fetching consultation dropdown:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching consultation dropdown.",
          null,
          error.message
        )
      );
  }
}

// Fetch FDE dropdown
async function fdeDropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch FDE dropdown");
    const data = await AppointmentService.fdeDropdown(req.query.location);
    return res
      .status(data.length ? 200 : 404)
      .send(
        new ApiResponse(200, "FDE dropdown fetched successfully.", null, data)
      );
  } catch (error) {
    console.error("Error while fetching FDE dropdown:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching FDE dropdown.",
          null,
          error.message
        )
      );
  }
}

// Fetch department dropdown
async function departmentDropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch department dropdown");
    const data = await AppointmentService.departmentDropdown();
    return res
      .status(data.length ? 200 : 404)
      .send(
        new ApiResponse(
          200,
          "Department dropdown fetched successfully.",
          null,
          data
        )
      );
  } catch (error) {
    console.error("Error while fetching department dropdown:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching department dropdown.",
          null,
          error.message
        )
      );
  }
}

// Fetch department dropdown
async function treatmentDropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch treatment dropdown");
    const data = await AppointmentService.treatmentDropdown();
    return res
      .status(data.length ? 200 : 404)
      .send(
        new ApiResponse(
          200,
          "treatment dropdown fetched successfully.",
          null,
          data
        )
      );
  } catch (error) {
    console.error("Error while fetching treatment dropdown:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching treatment dropdown.",
          null,
          error.message
        )
      );
  }
}

// Update historyChk flag when history button is clicked
async function updateHistoryChk(req, res) {
  try {
    const { appId, location } = req.query;
    console.log("Controller received request to update historyChk:", appId);
    if (!appId)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
    const result = await AppointmentService.updateHistoryChk(appId, location);
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
          error.message
        )
      );
  }
}

// Update executionChk flag when execution button is clicked
async function updateExecutionChk(req, res) {
  try {
    const { appId, location } = req.query;
    console.log("Controller received request to update executionChk:", appId);
    if (!appId)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
    const result = await AppointmentService.updateExecutionChk(appId, location);
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while updating executionChk:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating executionChk.",
          null,
          error.message
        )
      );
  }
}

// Update executionChk to 4 when button is clicked
async function updateExecutionChkToFour(req, res) {
  try {
    const { appointment_id } = req.params;
    console.log(
      "Controller received request to update executionChk to 4:",
      appointment_id
    );
    if (!appointment_id)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
    const result =
      await AppointmentService.updateExecutionChkToFour(appointment_id);
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while updating executionChk to 4:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating executionChk to 4.",
          null,
          error.message
        )
      );
  }
}

// Update consultationChk flag when consultation button is clicked
async function updateConsultationChk(req, res) {
  try {
    const { appId, location } = req.query;
    console.log(
      "Controller received request to update consultationChk:",
      appId
    );
    if (!appId)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
    const result = await AppointmentService.updateConsultationChk(
      appId,
      location
    );
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while updating consultationChk:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating consultationChk.",
          null,
          error.message
        )
      );
  }
}

async function saveReceipt(req, res, next) {
  try {
    console.log("Controller received request to save receipt:", req.body);
    const result = await AppointmentService.saveReceipt(req.body, req.user);
    console.log("Save Receipt Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while saving Receipt:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(500, "Error while saving Receipt.", null, error.message)
      );
  }
}

async function getPatientByMobile(req, res, next) {
  try {
    const { patient_phone } = req.query;

    if (!patient_phone) {
      return res
        .status(400)
        .send(new ApiResponse(400, "Mobile number is required.", null, null));
    }

    console.log(
      "Controller received request to fetch patient by mobile number:",
      patient_phone
    );
    const result = await AppointmentService.getPatientByMobile(patient_phone);

    console.log("Get Patient By Mobile Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching patient by mobile number:",
      error.message
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patient details.",
          null,
          error.message
        )
      );
  }
}
async function listReceipt(req, res) {
  try {
    console.log("Controller received request to list receipts:", req.body);

    // ✅ Call the function correctly
    const result = await AppointmentService.listReceipt(req.body, req.user);

    console.log("List Receipt Controller Result:", result);
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching receipts:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching receipts.",
          null,
          error.message
        )
      );
  }
}

// Function to delete an appointment
async function deleteAppointment(req, res) {
  try {
    const { appointment_id } = req.params; // Get appointment ID from request parameters
    console.log(
      "Controller received request to delete appointment:",
      appointment_id
    );

    if (!appointment_id) {
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
    }

    // Call the service to mark the appointment as deleted
    const result = await AppointmentService.deleteAppointment(appointment_id);

    if (result) {
      return res
        .status(200)
        .send(
          new ApiResponse(
            200,
            "Appointment marked as deleted successfully.",
            null,
            null
          )
        );
    } else {
      return res
        .status(404)
        .send(new ApiResponse(404, "Appointment not found.", null, null));
    }
  } catch (error) {
    console.error("Error while deleting appointment:", error.message);
    return res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while deleting appointment.",
          null,
          error.message
        )
      );
  }
}

module.exports = {
  addAppointment,
  editAppointment,
  listAppointments,
  confirmAppointment,
  doctorDropdown,
  consultationDropdown,
  fdeDropdown,
  departmentDropdown,
  updateHistoryChk,
  updateExecutionChk,
  updateExecutionChkToFour,
  updateConsultationChk,
  treatmentDropdown,
  saveReceipt,
  getPatientByMobile,
  listReceipt,
  deleteAppointment,
};
