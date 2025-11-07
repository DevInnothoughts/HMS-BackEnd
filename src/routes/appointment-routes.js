const express = require("express");

const route = express.Router();
const AppointmentController = require("../controller/appointment-controller");

route.post("/addAppointment", AppointmentController.addAppointment);

route.put(
  "/editAppointment/:appointment_id",
  AppointmentController.editAppointment
);

route.get("/listAppointments", AppointmentController.listAppointments);

route.put("/confirmAppointment", AppointmentController.confirmAppointment);

route.get("/doctorDropdown", AppointmentController.doctorDropdown);

route.get("/fdeDropdown", AppointmentController.fdeDropdown);

route.get("/consultationDropdown", AppointmentController.consultationDropdown);

route.get("/departmentDropdown", AppointmentController.departmentDropdown);

route.put("/updateHistoryChk", AppointmentController.updateHistoryChk);

route.put("/updateExecutionChk", AppointmentController.updateExecutionChk);

route.put(
  "/updateConsultationChk",
  AppointmentController.updateConsultationChk
);

route.put(
  "/updateExecutionChkToFour/:appointment_id",
  AppointmentController.updateExecutionChkToFour
);

route.get("/treatmentDropdown", AppointmentController.treatmentDropdown);

route.post("/saveReceipt", AppointmentController.saveReceipt);

route.get("/getPatientByMobile", AppointmentController.getPatientByMobile);

route.get("/listReceipt", AppointmentController.listReceipt);

route.delete(
  "/delete/:appointment_id",
  AppointmentController.deleteAppointment
);

module.exports = route;
