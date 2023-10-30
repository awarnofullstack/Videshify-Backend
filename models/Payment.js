const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    service: {
        type: String,
        required: true
    },
    reference_no: {
        type: String,
        required: false,
        default: null,
        unique: true
    },
    note: {
        type: String,
        required : false,
        default : ''
    }
},
    {
        timestamps: true
    }
);


module.exports = mongoose.model('Payment', PaymentSchema);