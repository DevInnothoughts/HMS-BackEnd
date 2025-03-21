const express = require("express");
const Authcontroller = require("../controller/auth-controller.js");

const router = express.Router();

router.post("/login", Authcontroller.login);

router.get("/locationDropdown",Authcontroller.locationDropdown)

module.exports = router;
