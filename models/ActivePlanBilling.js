const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")

const ActivePlanBillingSchema = Schema({
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'PlanBilling',
        required: true
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    paymentRef: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    }
},
    {
        timestamps: true
    }
);

ActivePlanBillingSchema.plugin(mongoosePaginate);
ActivePlanBillingSchema.plugin(aggregatePaginate);


module.exports = mongoose.model('ActivePlanBilling', ActivePlanBillingSchema);