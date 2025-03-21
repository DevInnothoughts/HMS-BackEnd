const mongoose = require("mongoose");

const prescriptionOpdSchema = new mongoose.Schema(
  {
    patient_id: {
      type: Number, // Correctly reference the Number type
    },
    prescription_type: {
      type: String,
    },
    allergy: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    advicesx: {
      type: String,
    },
    admmisionnote: {
      type: String,
    },
    medicine_name: {
      type: String,
    },
    medicine_time: {
      type: String,
    },
    medicine_quantity: {
      type: mongoose.Schema.Types.Number, // Correctly reference the Number type
    },
    medicine_days: {
      type: String,
    },
    surgical_advice: {
      type: String,
    },
    next_appointment: {
      type: String,
    },
    next_appointmentDate: {
      type: Date,
    },
    prescription_date: {
      type: Date,
    },
    assistant_doctor: {
      type: String,
    },
    surgeryadvice: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const prescriptionOpdDb = mongoose.model(
  "prescription",
  prescriptionOpdSchema,
  "prescription",
);
module.exports = prescriptionOpdDb;
