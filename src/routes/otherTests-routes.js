const express = require("express");

const route = express.Router();
const otherTestsController = require("../controller/otherTests-controller");

route.post("/addOtherTests/:patient_id", otherTestsController.addOtherTests);

route.put(
  "/updateOtherTests/:patient_id",
  otherTestsController.updateOtherTests,
);

route.get("/listOtherTests/:patient_id", otherTestsController.listOtherTests);

module.exports = route;
