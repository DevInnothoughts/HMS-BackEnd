const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoice_id: { type: String },
    admission_no: { type: String },
    patientName: { type: String },
    discharge_date: { type: String },
    dischargetime: { type: String },
    bed_category: { type: String },
    admission_date: { type: String },
    admissiontime: { type: String },
    consultantName: { type: String },
    surgeonName: { type: String },
    creation_date: { type: Date }, // Will store the `admission_date`
    pay_mode: { type: String },
    phone: { type: String },
    insurance: { type: String },
    tpa: { type: String },
    dynamicRows: [
      {
        label: { type: String },
        value: {
          type: Number,
          validate: {
            validator: function (v) {
              return v >= 0; // Value must be non-negative
            },
            message: (props) =>
              `${props.value} is not valid. Value must be a non-negative number.`,
          },
        },
      },
    ],
    Sub_Total: { type: Number },
    bill_Type: { type: String },
    bill_method: { type: String },
    chequeno: {
      type: Number,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) =>
          `${props.value} is not valid. Value must be a non-negative number.`,
      },
    },
    pdc: {
      type: Number,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) =>
          `${props.value} is not valid. Value must be a non-negative number.`,
      },
    },
    discount: {
      type: Number,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) =>
          `${props.value} is not valid. Value must be a non-negative number.`,
      },
    },
    payable_amt: { type: Number },
    note: { type: String },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to copy `admission_date` to `creation_date`
invoiceSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("admission_date")) {
    // Parse `admission_date` into a Date object and assign it to `creation_date`
    this.creation_date = this.admission_date
      ? new Date(this.admission_date)
      : undefined;
  }
  next();
});

// Model
const invoiceDb = mongoose.model("Invoice", invoiceSchema, "invoice");

module.exports = invoiceDb;
