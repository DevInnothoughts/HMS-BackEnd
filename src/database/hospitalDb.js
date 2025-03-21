const mongoose = require("mongoose");

const hospitalDbSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Location: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

HospitalDb = mongoose.model("hospital", hospitalDbSchema);

module.exports = HospitalDb;
