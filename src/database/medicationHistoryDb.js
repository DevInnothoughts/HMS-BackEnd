const mongoose = require("mongoose");

const medHisSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.Number, // Correctly reference the Number type
    },
    medicine: {
      type: String,
    },
    indication: {
      type: String,
    },
    since: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const medicationHistoryDb = mongoose.model(
  "medHis",
  medHisSchema,
  "medication_history",
);
module.exports = medicationHistoryDb;
