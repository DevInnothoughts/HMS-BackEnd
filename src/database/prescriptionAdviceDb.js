const mongoose = require("mongoose");

const prescriptionAdviceSchema = new mongoose.Schema(
  {
    padvice_desc: {
      type: String,
    },
    testadvice: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const prescriptionAdviceDb = mongoose.model(
  "prescriptionAdvice",
  prescriptionAdviceSchema,
  "prescription_advice",
);
module.exports = prescriptionAdviceDb;
