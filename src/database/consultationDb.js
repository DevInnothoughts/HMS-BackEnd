const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    consultation_id: {
      type: String,
      required: true,
    },
    consultation_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const consultationDb = mongoose.model(
  "Consultation",
  consultationSchema,
  "consultationdetails",
);

module.exports = consultationDb;
