const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
    {
        location_id: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        shortcode: {
            type: String,
            required:true,
        }
    },
    {
        timestamps: true,
    }
);

const LocationDb = mongoose.model('Location', locationSchema, 'location');
module.exports = LocationDb;