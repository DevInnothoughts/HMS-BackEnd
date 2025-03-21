const express=require('express')

const route=express.Router()
const InvoiceController=require('../controller/invoice-controller.js')

route.post('/addInvoice', InvoiceController.addInvoice);
route.put('/:invoice_id', InvoiceController.editInvoice);
route.get('/listInvoice', InvoiceController.listInvoice);
route.get('/consultant_dropdown', InvoiceController.consultant_dropdown);
route.get('/surgeon_dropdown', InvoiceController.surgeon_dropdown);
route.get('/insurance_co_dropdown', InvoiceController.insurance_co_dropdown);
route.get('/tpa_dropdown', InvoiceController.tpa_dropdown);

module.exports = route;
