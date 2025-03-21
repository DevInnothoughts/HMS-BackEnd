const express = require("express");

const route = express.Router();
const patienttabsdpController = require("../controller/patienttabsdp-controller.js");

route.get(
  "/assistantDoc_dropdown",
  patienttabsdpController.assistantDoc_dropdown,
);

route.get(
  "/medicineName_dropdown",
  patienttabsdpController.medicineName_dropdown,
);

route.get("/consultant_dropdown", patienttabsdpController.consultant_dropdown);

route.get("/surgeon_dropdown", patienttabsdpController.surgeon_dropdown);

route.get(
  "/surgeryAdvice_dropdown",
  patienttabsdpController.surgeryAdvice_dropdown,
);

route.get(
  "/surgeryType_dropdown",
  patienttabsdpController.surgeryType_dropdown,
);

route.get("/checkedBy_dropdown", patienttabsdpController.checkedBy_dropdown);

route.get("/madeby_dropdown", patienttabsdpController.madeby_dropdown);

route.get("/treatingby_dropdown", patienttabsdpController.treatingby_dropdown);

route.get("/injection_dropdown", patienttabsdpController.injection_dropdown);

// route.get(
//   "/anaesthetist_dropdown",
//   patienttabsdpController.anaesthetist_dropdown,
// );

route.get("/testType_dropdown", patienttabsdpController.testType_dropdown);

route.get(
  "/urologyMedicine_dropdown",
  patienttabsdpController.urologyMedicine_dropdown,
);

route.get(
  "/proctologyMedicine_dropdown",
  patienttabsdpController.proctologyMedicine_dropdown,
);

route.get(
  "/urologyTestAdvice_dropdown",
  patienttabsdpController.urologyTestAdvice_dropdown,
);

route.get(
  "/proctologyTestAdvice_dropdown",
  patienttabsdpController.proctologyTestAdvice_dropdown,
);

route.get(
  "/medicineType_dropdown",
  patienttabsdpController.medicineType_dropdown,
);

route.get(
  "/assistantDocUro_dropdown",
  patienttabsdpController.assistantDocUro_dropdown,
);

route.get(
  "/assistantDocProc_dropdown",
  patienttabsdpController.assistantDocProc_dropdown,
);

module.exports = route;
