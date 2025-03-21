const mongoose = require("mongoose");

const surgicalAdviceSchema = new mongoose.Schema(
  {
    surgical_advice_desc: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const surgicalAdviceDb = mongoose.model(
  "surgicalAdvice",
  surgicalAdviceSchema,
  "surgical_advice",
);
module.exports = surgicalAdviceDb;
