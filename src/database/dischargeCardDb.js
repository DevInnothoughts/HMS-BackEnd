const mongoose = require("mongoose");

const dischargeCardSchema = new mongoose.Schema(
  {
    patient_id: {
      type: Number, // Correctly reference the Number type
    },
    DOA: {
      type: String,
    },
    DOD: {
      type: String,
    },
    DOA_time: {
      type: String,
    },
    DOD_time: {
      type: String,
    },
    investigation: {
      type: String,
    },
    Follow_date: {
      type: String,
    },
    madeby: {
      type: String,
    },
    treatingby: {
      type: String,
    },
    checkedby: {
      type: String,
    },
    surgeryadvice: {
      type: String,
    },
    consultantName: {
      type: String,
    },
    IPDNo: {
      type: String,
    },
    BP: {
      type: String,
    },
    past_history: {
      type: String,
    },
    allergies: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    local_care: {
      type: String,
    },
    assistanceDoctor: {
      type: String,
    },
    surgical_history: {
      type: String,
    },
    admission_reason: {
      type: String,
    },
    findings: {
      type: String,
    },
    carenote: {
      type: String,
    },
    surgical_procedure: {
      type: String,
    },
    prescriptionAssign: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const dischargeCardDb = mongoose.model(
  "dischargeCard",
  dischargeCardSchema,
  "discharge_card",
);
module.exports = dischargeCardDb;
