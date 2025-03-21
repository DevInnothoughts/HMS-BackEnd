const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
    treatment_id:{
        type:Number,
    },
    treatment_name: {
        type:String,
    },
}, {
    timestamps: true, 
});

const treatmentDb = mongoose.model('treatment', treatmentSchema,'treatment');

module.exports=treatmentDb;