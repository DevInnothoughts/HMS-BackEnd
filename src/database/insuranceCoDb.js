const mongoose = require("mongoose");

const insuranceCoSchema = new mongoose.Schema(
  {
    companyname: {
      type: String,
    },
    company_type: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const insuranceCoDb = mongoose.model(
  "Insurance",
  insuranceCoSchema,
  "insurance_company",
);

module.exports = insuranceCoDb;
