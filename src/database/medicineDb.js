const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    medicine_type: {
      type: String,
    },
    name: {
      type: String,
    },
    status: {
      type: String,
    },
    medicine_dosage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const medicineDb = mongoose.model("medicine", medicineSchema, "medicine");
module.exports = medicineDb;
