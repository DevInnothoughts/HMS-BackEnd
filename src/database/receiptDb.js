const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
    receipt_id: { type: String, required: true, unique: true },
    receipt_date: { type: String, required: true },
    patient_id: { type: Number },
    appointment_id: { type: Number},
    doctor_id: { type: String },
    consultation: { type: String },
    comment: { type: String },
    sprayqty: { type: Number },
    totalamt: { type: Number },
    discountnote: { type: String },
    discountamt: { type: Number },
    paymentmode: { type: String },
    otherdetails: { type: String },
    chargeCondition: { type: String },
    is_deleted: { type: Boolean, default: false }
}, { collection: 'patient_receipt' });

const ReceiptDb = mongoose.model('Receipt', receiptSchema);
module.exports = ReceiptDb;