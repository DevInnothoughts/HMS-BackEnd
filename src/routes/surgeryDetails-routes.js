const express = require("express");

const route = express.Router();
const surgeryDetailsController = require("../controller/surgeryDetails-controller");

route.post(
  "/addSurgeryDetails/:patient_id",
  surgeryDetailsController.addSurgeryDetails,
);

route.put(
  "/updateSurgeryDetails/:patient_id",
  surgeryDetailsController.updateSurgeryDetails,
);

route.get(
  "/listSurgeryDetails/:patient_id",
  surgeryDetailsController.listSurgeryDetails,
);

route.get(
  "/listAllSurgeryDetails",
  surgeryDetailsController.listAllSurgeryDetails,
);

route.post(
  "/addPatientComment/:patient_id",
  surgeryDetailsController.addPatientComment,
);

module.exports = route;
