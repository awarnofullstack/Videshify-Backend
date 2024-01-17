const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2")

const WalletTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    reference: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: false,
    },
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule',
        required: false,
    },
    // Add other relevant fields as needed
}, { timestamps: true });

WalletTransactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);