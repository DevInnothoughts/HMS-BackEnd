const express = require("express");

const route = express.Router();
const patientHistoryController = require("../controller/patientHistory-controller.js");

route.post(
  "/addPatientHistory/:patient_id",
  patientHistoryController.addPatientHistory,
);

route.put(
  "/updatePatientHistory/:patient_id",
  patientHistoryController.updatePatientHistory,
);

route.get(
  "/listPatientHistory/:patient_id",
  patientHistoryController.listPatientHistory,
);

route.put(
  "/updateHistoryChk/:patient_id",
  patientHistoryController.updateHistoryChk,
);

module.exports = route;
