const express=require('express')

const route=express.Router()
const ConsultationController=require('../controller/consultation-controller.js')

route.post('/addConsultation', ConsultationController.addConsultation);

module.exports = route

