const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    doctor_id: {
      type: Number, // Correctly reference the Number type
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    doctor_type: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    job_location: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department_id: {
      type: String,
      required: true,
    },
    profile: {
      type: [String],
      required: false,
    },
    is_deleted: {
      type: String,
      default: "false", // Default to not deleted
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const DoctorDb = mongoose.model("Doctor", doctorSchema, "doctor");
module.exports = DoctorDb;
