const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.Number, // Correctly reference the Number type
    },
    uidNo: {
      type: String,
    },
    patientName: {
      type: String,
    },
    age: {
      type: String,
    },
    mobileNo: {
      type: String,
    },
    address: {
      type: String,
    },
    occupation: {
      type: String,
    },
    email: {
      type: String,
    },
    reference: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    advice: {
      type: String,
    },
    plan: {
      type: String,
    },
    present_complaints: {
      type: String,
    },
    firstVisitDate: {
      type: String,
    },
    followup_id: {
      type: mongoose.Schema.Types.Number, // Correctly reference the Number type
    },
  },
  {
    timestamps: true,
  },
);

const followUpDb = mongoose.model("followUp", followUpSchema, "followup_data");
module.exports = followUpDb;
