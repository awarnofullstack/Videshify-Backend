const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2")

const RespondSchema = new Schema({
    _id: Schema.Types.ObjectId,
    message: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: false
    },
    isQuote: {
        type: Boolean,
        require: false,
        default: false
    },
    service_name: {
        type: String,
        required: false
    },
    service_price: {
        type: Number,
        required: false
    },
    duration: {
        type: Number,
        required: false
    },
    start_time: {
        type: Date,
    }
});

const InquirySchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    responds: {
        type: [RespondSchema]
    }
},
    {
        timestamps: true,
        versionKey: false
    });

InquirySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Enquiry', InquirySchema);