const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema(
  {
    test_id: {
      type: Number,
    },
    test_name: {
      type: String,
    },
    test_code: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const labTestDb = mongoose.model("labTest", labTestSchema, "lab_test");
module.exports = labTestDb;
