const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2")

const RespondSchema = new Schema({
    _id: Schema.Types.ObjectId,
    message: {
        type: String,
        required: true
    },
    attachment: {
        type: String,
        default: '',
        required: false
    },
    isQuote: {
        type: Boolean,
        required: false,
        default: false
    },
    service_name: {
        type: String,
        default: '',
        required: false
    },
    amount: {
        type: Number,
        required: false
    },
    duration: {
        type: Number,
        required: false
    },
    sender: {
        type: String,
        enum: ['counselor', 'student'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    start_time: {
        type: Date,
        default: null,
        required: false
    }
}, {
    timestamps: true,
    versionKey: false
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
    },
    category: {
        type: String,
    },
    status: {
        type: String,
        enum: ['opened', 'closed'],
        default: 'opened'
    }
},
    {
        timestamps: true,
        versionKey: false
    });

InquirySchema.plugin(mongoosePaginate);


InquirySchema.set('toJSON', { virtuals: true })

InquirySchema.virtual('unreadRespondsStudentCount').get(function () {
    if (this.responds && Array.isArray(this.responds)) {
        const unreadResponds = this.responds.filter(respond => (!respond.isRead && respond.sender !== 'student'));
        return unreadResponds.length;
    } else {
        return 0;
    }
});

InquirySchema.virtual('unreadRespondsCounselorCount').get(function () {
    if (this.responds && Array.isArray(this.responds)) {
        const unreadResponds = this.responds.filter(respond => (!respond.isRead && respond.sender == 'student'));
        return unreadResponds.length;
    } else {
        return 0;
    }
});

module.exports = mongoose.model('Enquiry', InquirySchema);