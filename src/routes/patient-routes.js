const express = require("express");

const route = express.Router();
const PatientController = require("../controller/patient-controller");

route.post("/addPatient", PatientController.addPatient);

route.put("/", PatientController.editPatient);

route.get("/listPatient", PatientController.listPatient);

module.exports = route;
