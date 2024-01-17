const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const WalletTransactionSchema = new Schema({
    wallet_id: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    service: {
        type: String,
        required: false,
        default: null
    },
    reference_no: {
        type: String,
        required: false,
        default: null
    },
    note: {
        type: String,
        required: false,
        default: ''
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);