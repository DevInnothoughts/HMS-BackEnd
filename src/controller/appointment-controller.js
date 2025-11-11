const ApiResponse = require("../utils/api-response");
const AppointmentService = require("../service/appointment-services");

// Define the formatPhoneNumber function (kept for clarity in controller logic)
function formatPhoneNumber(phoneNumber) {
  if (phoneNumber && typeof phoneNumber === "string") {
    return phoneNumber.replace(/\D/g, ""); // Remove non-digit characters
  }
  return ""; // Return empty string if invalid
}

// -------------------------------------------------------------------------
//                         APPOINTMENT CONTROLLERS
// -------------------------------------------------------------------------

// Add a new appointment
async function addAppointment(req, res, next) {
  try {
    console.log(
      "Controller received request to add appointment:",
      req.body.phone
    );
    // The service handles location inference from req.body.patient_location or req.user
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

// Edit Appointment
async function editAppointment(req, res, next) {
  try {
    console.log("Incoming request to edit appointment");

    const patient_phone =
      req.params.patient_phone ||
      req.query.patient_phone ||
      req.body.patient_phone;

    if (!patient_phone) {
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
    if (!formattedPhone) {
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

    // Call service. The service handles location inference from req.body.patient_location or req.user
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

// List all appointments
async function listAppointments(req, res, next) {
  try {
    console.log("Controller received request to list all appointments.");
    const { from, to, location } = req.query; // ✅ Extract location

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

    // ✅ Pass all query parameters including location
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
    const { appId, location } = req.query; // ✅ Extract location
    console.log("Controller received request to confirm appointment:", appId);
    if (!appId)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
        
    // ✅ Pass location to the service layer
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

// -------------------------------------------------------------------------
//                         DROPDOWN CONTROLLERS
// -------------------------------------------------------------------------

// Fetch doctor dropdown
async function doctorDropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch doctor dropdown");
    const { location } = req.query; // ✅ Extract location
    const data = await AppointmentService.doctorDropdown(location); // ✅ Pass location

    const doctors = Array.isArray(data) ? data : [];

    return res
      .status(doctors.length ? 200 : 404)
      .send(
        new ApiResponse(
          doctors.length ? 200 : 404,
          doctors.length
            ? "Doctor dropdown fetched successfully."
            : "No doctors found.",
          null,
          doctors
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
    const { location } = req.query; // ✅ Extract location
    const data = await AppointmentService.consultationDropdown(location); // ✅ Pass location

    const consultations = Array.isArray(data) ? data : [];

    return res
      .status(consultations.length ? 200 : 404)
      .send(
        new ApiResponse(
          200,
          "Consultation dropdown fetched successfully.",
          null,
          consultations
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
    const { location } = req.query; // ✅ Extract location
    const data = await AppointmentService.fdeDropdown(location); // ✅ Pass location

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
    const { location } = req.query; // ✅ Extract location
    const data = await AppointmentService.departmentDropdown(location); // ✅ Pass location

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

// Fetch treatment dropdown
async function treatmentDropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch treatment dropdown");
    const { location } = req.query; // ✅ Extract location
    const data = await AppointmentService.treatmentDropdown(location); // ✅ Pass location

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

// -------------------------------------------------------------------------
//                         PROCESS FLAG CONTROLLERS
// -------------------------------------------------------------------------

// Update historyChk flag
async function updateHistoryChk(req, res) {
  try {
    const { appId, location } = req.query; // ✅ Extract location
    console.log("Controller received request to update historyChk:", appId);
    if (!appId)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
        
    // ✅ Pass location
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

// Update executionChk flag
async function updateExecutionChk(req, res) {
  try {
    const { appId, location } = req.query; // ✅ Extract location
    console.log("Controller received request to update executionChk:", appId);
    if (!appId)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
        
    // ✅ Pass location
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

// Update executionChk to 4
async function updateExecutionChkToFour(req, res) {
  try {
    const { appointment_id } = req.params;
    const location = req.query.location || req.user.location; // Infer location
    console.log(
      "Controller received request to update executionChk to 4:",
      appointment_id
    );
    if (!appointment_id)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
        
    // ✅ Pass location
    const result =
      await AppointmentService.updateExecutionChkToFour(appointment_id, location);
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

// Update consultationChk flag
async function updateConsultationChk(req, res) {
  try {
    const { appId, location } = req.query; // ✅ Extract location
    console.log(
      "Controller received request to update consultationChk:",
      appId
    );
    if (!appId)
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
        
    // ✅ Pass location
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

// -------------------------------------------------------------------------
//                         RECEIPT/PATIENT CONTROLLERS
// -------------------------------------------------------------------------

async function saveReceipt(req, res, next) {
  try {
    console.log("Controller received request to save receipt:", req.body);
    const location = req.query.location || req.user.location; // Infer location
    
    // ✅ Pass location explicitly
    const result = await AppointmentService.saveReceipt(req.body, location); 
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
    const { patient_phone, location } = req.query; // ✅ Extract location

    if (!patient_phone) {
      return res
        .status(400)
        .send(new ApiResponse(400, "Mobile number is required.", null, null));
    }

    console.log(
      "Controller received request to fetch patient by mobile number:",
      patient_phone
    );
    // ✅ Pass location explicitly
    const result = await AppointmentService.getPatientByMobile(patient_phone, location);

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
    console.log("Controller received request to list receipts:", req.query);
    const { location } = req.query; // ✅ Extract location

    // ✅ Pass both query params and location
    const result = await AppointmentService.listReceipt(req.query, location); 

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
    const { appointment_id } = req.params;
    const location = req.query.location || req.user.location; // Infer location
    
    console.log(
      "Controller received request to delete appointment:",
      appointment_id
    );

    if (!appointment_id) {
      return res
        .status(400)
        .send(new ApiResponse(400, "Appointment ID is required.", null, null));
    }

    // ✅ Pass location
    const result = await AppointmentService.deleteAppointment(appointment_id, location);

    // The service now returns an ApiResponse object, handle it consistently
    return res.status(result.statusCode).send(result);
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