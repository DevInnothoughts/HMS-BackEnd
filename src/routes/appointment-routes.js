const express = require('express');

const route = express.Router();
const AppointmentController = require('../controller/appointment-controller');

route.post('/addAppointment', AppointmentController.addAppointment);

route.put('/editAppointment/:appointment_id', AppointmentController.editAppointment);

route.get('/listAppointments', AppointmentController.listAppointments);

route.put('/confirmAppointment/:appointment_id', AppointmentController.confirmAppointment);

route.get('/doctorDropdown', AppointmentController.doctorDropdown);

route.get('/fdeDropdown', AppointmentController.fdeDropdown);

route.get('/consultationDropdown', AppointmentController.consultationDropdown);

route.get('/departmentDropdown', AppointmentController.departmentDropdown);

route.put('/updateHistoryChk/:appointment_id', AppointmentController.updateHistoryChk);

route.put('/updateExecutionChk/:appointment_id', AppointmentController.updateExecutionChk);

route.put('/updateConsultationChk/:appointment_id', AppointmentController.updateConsultationChk);

route.put('/updateExecutionChkToFour/:appointment_id', AppointmentController.updateExecutionChkToFour);

route.get('/treatmentDropdown', AppointmentController.treatmentDropdown);

route.post('/saveReceipt', AppointmentController.saveReceipt);

route.get("/getPatientByMobile", AppointmentController.getPatientByMobile);

route.get("/listReceipt", AppointmentController.listReceipt);

route.delete('/delete/:appointment_id', AppointmentController.deleteAppointment);

module.exports = route;