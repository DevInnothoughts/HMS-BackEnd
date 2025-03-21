const express = require("express");

const route = express.Router();
const patienttabsController = require("../controller/patienttabs-controller.js");

route.get("/personal/:patient_id", patienttabsController.personal);

route.put("/editPersonal/:patient_id", patienttabsController.editPersonal);

// route.get('/listDiagnosis/:patient_id',patienttabsController.listDiagnosis);

// route.put('/diagnosis/:patient_id', patienttabsController.diagnosis);

// route.get('/listFollowUp/:patient_id', patienttabsController.listFollowUp);

// route.put('/followUp/:patient_id', patienttabsController.followUp);

// route.put('/otherTests/:patient_id', patienttabsController.otherTests);

// route.get('/listPrescription/:patient_id',patienttabsController.listPrescription);

// route.put('/opd_prescription/:patient_id', patienttabsController.opd_prescription);

// route.get('/listSurgeryDetails/:patient_id',patienttabsController.listSurgeryDetails);

// route.put('/surgeryDetails/:patient_id', patienttabsController.surgeryDetails);

// route.get('/listDischargeCard/:patient_id',patienttabsController.listDischargeCard)

// route.put('/dischargeCard/:patient_id', patienttabsController.dischargeCard);

module.exports = route;
