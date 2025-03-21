const mongoose = require('mongoose');

const fdeSchema = new mongoose.Schema(
    {
        FDEID: {
            type: Number,
            required: true,
        },
        FDEName: {
            type: String,
            required: true,
        },
        PhoneNo: {
            type: String,
            required: true,
        },
        EmailID: {
            type: String,
            required: true,
        },
        Password: {
            type: String,
            required: true,
        },
        Address: {
            type: String,
            required: true,
        },
        JobLocation: {
            type: String,
            required: true,
        },
        is_deleted: {
            type: String,
            default: "false", // Default to not deleted
        },
    },
    {
        timestamps: true,
    }
);

const FDEdetailsDb = mongoose.model('Fdedetails', fdeSchema, 'fdedetails');
module.exports = FDEdetailsDb;
