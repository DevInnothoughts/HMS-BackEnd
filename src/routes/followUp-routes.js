const express = require("express");

const route = express.Router();
const followUpController = require("../controller/followUp-controller.js");

route.get("/listFollowUp/:patient_id", followUpController.listFollowUp);

route.put("/followUp/:patient_id", followUpController.followUp);

module.exports = route;
