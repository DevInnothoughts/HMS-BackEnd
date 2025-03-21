const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({ 
    doctorName: { type: String },
    date: { type: mongoose.Schema.Types.Mixed },  
    enquirytype: { type: String },
    patient_name: { type: String },  
    patient_phone: { type: String }, 
    patient_location: { type: String },
    reference: { type: String },
    FDE_Name: { type: String }, 
    note: { type: String }, 
}, {
    timestamps: true, 
});

const enquiryDb = mongoose.model('Enquiry', enquirySchema, 'appointment_enquiry');

module.exports = enquiryDb;
