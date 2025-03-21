const express=require('express')

const route=express.Router()
const EnquiryController=require('../controller/enquiry-controller.js')

route.post('/addEnquiry', EnquiryController.addEnquiry);

route.get('/listEnquiry',EnquiryController.listEnquiry);

route.get('/doctorDropdown', EnquiryController.doctorDropdown);

module.exports = route;