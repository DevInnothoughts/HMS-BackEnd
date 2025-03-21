const mongoose = require("mongoose");

const otherTestSchema = new mongoose.Schema(
  {
    test_date: {
      type: Date, // Consider using a Date type for better date handling
    },
    test_type: {
      type: String,
    },
    ref_doctor: {
      type: String,
    },
    fee_status: {
      type: String,
    },
    visit_type: {
      type: String,
    },
    test_comment: {
      type: String,
    },
    patient_id: {
      // Add the patient_id field
      type: Number, // Correctly reference the Number type
      required: true,
    },
    test_response: {
      type: String, // Store the test response as a string (or JSON if needed)
    },
    receipt_status: {
      type: Number,
      default: 0, // assuming it's an integer
    },
  },
  {
    timestamps: true,
  },
);

const otherTestsDb = mongoose.model(
  "otherTests",
  otherTestSchema,
  "other_tests",
);
module.exports = otherTestsDb;
