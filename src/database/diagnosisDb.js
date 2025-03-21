const mongoose = require("mongoose");

const diagnosisSchema = new mongoose.Schema(
  {
    patient_id: {
      type: Number, // Correctly reference the Number type
    },
    diagnosis: {
      type: String,
    },
    advice: {
      type: String,
    },
    date_diagnosis: {
      type: String,
    },
    investigationorders: {
      type: String,
    },
    provisionaldiagnosis: {
      type: String,
    },
    comment: {
      type: String,
    },
    adviceComment: {
      type: String,
    },
    RF: {
      type: String,
    },
    Laser: {
      type: String,
    },
    MW: {
      type: String,
    },
    categoryComment: {
      type: String,
    },
    insurance: {
      type: String,
    },
    insuranceCompany: {
      type: String,
    },
    workshop: {
      type: String,
    },
    consultantDoctor: {
      type: String,
    },
    assistanceDoctor: {
      type: String,
    },
    SurgicalDate: {
      type: String,
    },
    diagnosisAdvice: {
      type: String,
    },
    medicines: {
      type: String,
    },
    other: {
      type: String,
    },
    speciality: {
      type: String,
    },
    symptoms: {
      type: String,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const diagnosisDb = mongoose.model("diagnosis", diagnosisSchema, "diagnosis");
module.exports = diagnosisDb;
