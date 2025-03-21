const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema({
    receptionist_id: {
        type: Number,
        required: true,    
    },
    name:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true,
    },
    phone:{
        type: String,
        required: true,
    },
    job_location:{
        type: String,
        required: true,
    },
    is_deleted:{
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, 
});

const receptionistDb = mongoose.model('Receptionist', receptionistSchema,'receptionist');

module.exports=receptionistDb;