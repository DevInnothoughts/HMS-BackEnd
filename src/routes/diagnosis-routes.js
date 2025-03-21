const express = require("express");

const route = express.Router();
const diagnosisController = require("../controller/diagnosis-controller");

route.post("/addDiagnosis/:patient_id", diagnosisController.addDiagnosis);

route.put("/updateDiagnosis/:patient_id", diagnosisController.updateDiagnosis);

route.get("/listDiagnosis/:patient_id", diagnosisController.listDiagnosis);

route.get("/listAllDiagnosis", diagnosisController.listAllDiagnosis);

route.post(
  "/addDoctorComment/:patient_id",
  diagnosisController.addDoctorComment,
);

module.exports = route;
