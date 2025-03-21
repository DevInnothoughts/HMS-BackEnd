const mongoose = require("mongoose");

const refDocSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.Number, // Correctly reference the Number type
    },
    reference_doctor_id: {
      type: Number,
    },
    ref_doctor_name: {
      type: String,
    },
    ref_doctor_phone: {
      type: String,
    },
    reference_doctor_speciality: {
      type: String,
    },
    reference_doctor_location: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const refDocDb = mongoose.model("refDoc", refDocSchema, "reference_doctor");

module.exports = refDocDb;
