const mongoose = require("mongoose");

const patientHistorySchema = new mongoose.Schema(
  {
    patient_id: {
      type: Number, // Correctly reference the Number type
    },
    patient_date: {
      type: Date,
    },
    height: {
      type: String,
    },
    weight: {
      type: String,
    },
    painscale: {
      type: String,
    },
    BP: {
      type: String,
    },
    Pulse: {
      type: String,
    },
    RR: {
      type: String,
    },
    RS: {
      type: String,
    },
    CVS: {
      type: String,
    },
    CNS: {
      type: String,
    },
    PA: {
      type: String,
    },
    family_history: {
      type: String,
    },
    general_history: {
      type: String,
    },
    past_history: {
      //past medical history
      type: String,
    },
    habits: {
      type: String,
    },
    drugs_allery: {
      type: String,
    },
    complaints: {
      type: String,
    },
    presentcomplaints: {
      type: String,
    },
    ongoing_medicines: {
      type: String,
    },
    investigation: {
      //previous investigation
      type: String,
    },
    knowncaseof: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    symptoms: {
      type: String,
    },
    doctor_id: {
      type: Number,
    },
    medical_mx: {
      type:String,
    },
    comment: {
      type:String,
    },
     piles_duration  : {
      type:String,
    },
    
    fistula_duration: {
      type:String,
    },
   varicose_duration: {
      type:String,
    },
    Urinary_incontinence_duration: {
      type:String,
    },
    Fecal_incontinence_duration: {
      type:String,
    },
    hernia_duration: {
      type:String,
    },
    ODS_duration: {
      type:String,
    },
    pilonidalsinus: {
      type:String,
    },
  circumcision: {
      type:String,
    },
  },
  {
    timestamps: true,
  },
);

const patientHistoryDb = mongoose.model(
  "patientHistory",
  patientHistorySchema,
  "patient_history",
);
module.exports = patientHistoryDb;
