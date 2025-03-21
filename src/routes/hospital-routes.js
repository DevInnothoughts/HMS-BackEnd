const express = require("express");

const route = express.Router();
const HospitalController = require("../controller/hospital-controller");

//register Hospital
route.post("/addHospital", HospitalController.addHospital);

route.get("/listHospital", HospitalController.listHospital);

module.exports = route;
