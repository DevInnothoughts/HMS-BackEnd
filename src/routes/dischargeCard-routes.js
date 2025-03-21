const express = require("express");

const route = express.Router();
const dischargeCardController = require("../controller/dischargeCard-controller.js");

route.post(
  "/addDischargeCard/:patient_id",
  dischargeCardController.addDischargeCard,
);

route.put(
  "/updateDischargeCard/:patient_id",
  dischargeCardController.updateDischargeCard,
);

route.get(
  "/listDischargeCard/:patient_id",
  dischargeCardController.listDischargeCard,
);

module.exports = route;
