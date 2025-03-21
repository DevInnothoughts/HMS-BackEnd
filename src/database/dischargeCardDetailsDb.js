const mongoose = require("mongoose");

const ddcSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.Number, // Correctly reference the Number type
    },
    surgery_test: {
      type: String,
    },
    surgery_type: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const dischargeCardDetailsDb = mongoose.model(
  "ddc",
  ddcSchema,
  "dischargecarddetails",
);
module.exports = dischargeCardDetailsDb;
