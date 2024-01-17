const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlanBillingSchema = Schema({
    label: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['basic', 'standard', 'pro'],
        unique: true,
        required: true
    },
    uptomembers: {
        type: Number,
        default: 0,
    },
    totalActivations: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: true
    },
},
    {
        timestamps: true
    }
);


module.exports = mongoose.model('PlanBilling', PlanBillingSchema);