const mongoose = require("mongoose");

const surgeonSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const surgeonDb = mongoose.model("Surgeon", surgeonSchema);

module.exports = surgeonDb;
