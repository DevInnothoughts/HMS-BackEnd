const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    department_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const departmentDb = mongoose.model(
  "Department",
  departmentSchema,
  "department",
);
module.exports = departmentDb;
