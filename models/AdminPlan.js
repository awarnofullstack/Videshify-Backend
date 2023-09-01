const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminPlanBillingSchema = Schema({
    plan_name: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['basic', 'standard', 'pro'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    badge: {
        type: String,
        default: '',
        required: false
    },
    features: {
        number_of_users: {
            type: Number,
            required: true
        },
        premium_support: {
            type: Boolean,
            default: true,
            required: false
        }
    },
    active: {
        type: Boolean,
        required: false,
        default: true
    },
},
    {
        timestamps: true
    }
);


module.exports = mongoose.model('AdminPlanBilling', AdminPlanBillingSchema);