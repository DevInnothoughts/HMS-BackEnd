const mongoose = require('mongoose');

// Helper function to generate a unique UID
function generateUniqueUid() {
    const prefix = "HHCDP"; // Example prefix for UIDs
    const uniqueNumber = Date.now() + Math.floor(Math.random() * 1000); // Ensures a unique value based on timestamp
    return `${prefix}${uniqueNumber}`;
}

const patientSchema = new mongoose.Schema({
    patient_id: {
        type: Number,
    },
    Uid_no: {
        type: String,
    },
    date: {
        type: String,
    },
    name: {
        type: String,
    },
    prefix: {
        type: String,
    },
    sex: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    pincode: {
        type: String,
    },
    companyname: {
        type: String,
    },
    age: {
        type: String,
    },
    ref: {
        type: String,
    },
    reference_type: {
        type: String,
    },
    occupation: {
        type: String,
    },
    address: {
        type: String,
    },
    registeration_id: {
        type: Number,
    },
    mobile_2: {
        type: String,
    },
    timestamp_date: {
        type: String,
    },
    blood_group: {
        type: String,
    },
    birth_date: {
        type: String,
    },
    password: {
        type: String,
    },
    account_opening_timestamp: {
        type: String,
    },
    image: {
        type: String,
    },
    is_deleted: {
        type: String,
    },
    specific_work: {
      type: String,  
    },
    patient_location: {
        type: String,
    },
    ConfirmPatient: {
        type: Number,
        default: 0, // Default value is 0 (not confirmed)
    },
    feedback: {
        type: String,
    },
    patient_type: {
        type: String,
    },
    identity: {
        type: String
    },
}, {
    timestamps: true,
});

// Pre-save middleware to generate Uid_no if not provided
patientSchema.pre('save', function (next) {
    if (!this.Uid_no) {
        this.Uid_no = generateUniqueUid();
    }
    next();
});

const patientDb = mongoose.model('Patient', patientSchema, 'patient');

module.exports = patientDb;