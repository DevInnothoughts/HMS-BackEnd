const mongoose = require('mongoose');

// ... existing code for receiptSchema and ReceiptDb ...

const itemReceiptSchema = new mongoose.Schema({
    item_id: { type: Number, required: true },
    receipt_id: { type: String, required: true },
    patient_id: { type: Number, required: true },
    item_date: { type: Date, required: true },
    consultation: { type: String },
    total: { type: Number },
    payment_mode: { type: String },
    is_deleted: { type: Number, default: 0 }
}, { collection: 'patient_itemreceipt' });

// Add index for faster queries
itemReceiptSchema.index({ receipt_id: 1 });

const ItemReceiptDb = mongoose.model('ItemReceipt', itemReceiptSchema);

module.exports = ItemReceiptDb;