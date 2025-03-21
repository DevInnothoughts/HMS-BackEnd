const mongoose = require("mongoose");

const urologySchema = new mongoose.Schema(
  {
    patient_id: {
      type: Number, // Correctly reference the Number type
    },
    spo2: {
      type: String,
    },
    pulse: {
      type: String,
    },
    RR: {
      type: String,
    },
    temperature: {
      type: String,
    },
    investigation: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const urologyDb = mongoose.model("urology", urologySchema, "urology");
module.exports = urologyDb;
