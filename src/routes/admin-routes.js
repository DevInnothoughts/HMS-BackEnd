const express = require("express");

const route = express.Router();
const AdminController = require("../controller/admin-controller");

//register Admin
route.post("/addDoctor", AdminController.addDoctor);

route.put("/:email", AdminController.editDoctor);

route.get("/listDoctor", AdminController.listDoctor);

module.exports = route;
