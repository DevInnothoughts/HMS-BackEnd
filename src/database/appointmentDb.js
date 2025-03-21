const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    email: {
        type: String
    },
    prefix: {
        type: String
    },
    gender: {
        type: String
    },
    departmentName: {
        type: String
    },
    appointmentWith: {
        type: String
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    patientName: {
        type: String
    },
    reference: {
        type: String
    },
    appointmentTime: {
        type: String
    },
    confirm_time: {
        type: String
    },
    appointment_id: {
        type: Number
    },
    doctor_id: {
        type: Number
    },
    patient_id: {
        type: Number,
        required: false,
        default: null
    },
    consultation_name: {
        type: String
    },
    patient_phone: {
        type: String
    },
    patient_type: {
        type: String
    },
    appointment_timestamp: {
        type: String
    },
    status: {
        type: String
    },
    is_deleted: {
        type: Number,
        default: 0
    },
    cancelComment: {
        type: String
    },
    historychk: {
        type: Number,
        default: 0     //default 0
    },
    executivechk: {
        type: Number,
        default:0     //default0
    },
    consultationchk: {
        type: Number,
        default:0     //default 0
    },
    treatment_name: {
        type: String
    },
    patient_location: { // address
        type: String,
    },
    FDE_Name: {
        type: String
    },
    ConfirmPatient: { 
        type: Number,
        default: 0
    }, // default is 0 (unconfirmed)
    note: {
        type: String
    },
    doctorName: {
        type: String
    },
}, {
    timestamps: true
});

appointmentSchema.pre('save', function (next) {
  if (this.confirmPatient === 1 && !this.confirm_time) {
    // Set the confirmation time if the appointment is confirmed
    this.confirm_time = moment().format("h:mm A");
  }
  next();
});

const appointmentDb = mongoose.model('Appointment', appointmentSchema, 'appointment');

module.exports = appointmentDb;
