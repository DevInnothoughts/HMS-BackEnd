const express = require("express");

const route = express.Router();
const ReceptionistController = require("../controller/receptionist-controller.js");

//register Receptionist
route.post("/addReceptionist", ReceptionistController.addReceptionist);

module.exports = route;
