const express = require("express");

const route = express.Router();
const prescriptionController = require("../controller/prescription-controller");

route.post(
  "/addPrescription/:patient_id",
  prescriptionController.addPrescription,
);

route.put(
  "/updatePrescription/:patient_id",
  prescriptionController.updatePrescription,
);

route.get(
  "/listPrescription/:patient_id",
  prescriptionController.listPrescription,
);

module.exports = route;
