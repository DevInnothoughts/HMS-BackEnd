const express = require('express');
const route = express.Router();
const IvrdataController = require('../controller/ivrdata-controller');

// Route to list IVR data
route.get('/listIvrdata', IvrdataController.listIvrdata);
route.get('/doctor_dropdown', IvrdataController.doctorDropdown);
route.get('/fde_dropdown', IvrdataController.fdeDropdown);
route.get('/enquiry_dropdown', IvrdataController.enquiryDropdown);
route.put('/editNote/:ivr_id', IvrdataController.editNote);

module.exports = route;
