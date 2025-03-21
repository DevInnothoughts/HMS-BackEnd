const mongoose = require("mongoose");

const surgeryDetailsSchema = new mongoose.Schema(
  {
    patient_id: {
      type: String, // Correctly reference the Number type
    },
    plan: {
      type: String,
    },
    admission_date: {
      type: Date,
    },
    surgery_date: {
      type: Date,
    },
    risk_consent: {
      type: String,
    },
    anesthesia: {
      type: String,
    },
    additional_comment: {
      type: String,
    },
    assistanceDoctor: {
      type: String,
    },
    surgery_note: {
      type: String,
    },
    anaesthetist: {
      type: String,
    },
    surgery_remarks: {
      type: String,
    },
    opd_feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const surgeryDetailsDb = mongoose.model(
  "SurgeryDetails",
  surgeryDetailsSchema,
  "surgery_details",
);

module.exports = surgeryDetailsDb;
