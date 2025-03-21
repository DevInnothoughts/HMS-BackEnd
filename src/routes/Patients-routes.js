const express = require("express");

const route = express.Router();
const PatientsController = require("../controller/Patients-controller.js");

route.get("/listPatient", PatientsController.listPatient);

route.get("/listRefPatient/:phone", PatientsController.listRefPatient);

route.get("/listDoctor", PatientsController.listDoctor);

module.exports = route;
