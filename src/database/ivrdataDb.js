const mongoose = require('mongoose');

const ivrdataDbSchema = new mongoose.Schema({
    ivr_id: { type: Number, required: true },
    call_type: { type: String, required: true },
    call_date: { type: String, required: true },
    call_time: { type: String, required: true },
    caller_no: { type: String, required: true },
    destination_no: { type: String, required: true },
    call_status: { type: String, required: true },
    call_duration: { type: String, required: true },
    circle_name: { type: String, required: true },
    destination_name: { type: String, required: true },
    status: { type: String, required: true },
    note: { type: String, required: true },
    source: { type: String, required: true },
}, { timestamps: true });

const IvrdataDb = mongoose.model('Ivrdata', ivrdataDbSchema, 'ivrdata');

module.exports = IvrdataDb;
