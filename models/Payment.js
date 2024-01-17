const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2")

const PaymentSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
        enum: ['consultation', 'plan purchase'],
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
        required: false,
        default: ''
    }
},
    {
        timestamps: true
    }
);

PaymentSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Payment', PaymentSchema);