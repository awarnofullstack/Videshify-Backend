const mongoose = require("mongoose");
const Schema = mongoose.Schema

const mongoosePaginate = require("mongoose-paginate-v2")


const ScheduleSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    topic: {
        type: String,
        required: true
    },
    invite_link: {
        type: String,
    },
    meeting_id: {
        type: String,
    },
    assigned_to: {
        type: Schema.Types.ObjectId,
        ref: 'CounselorMember',
        required: false
    },
    start_time: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['service', 'quote'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'rejected', 'complete'],
        default: 'pending'
    },
    description: {
        type: String,
        required: false
    },
    payment_ref: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        required: true,
        unique: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    is_reschedule: {
        type: Boolean,
        default: false
    },
    reschedule_at: {
        type: Date,
        required: false,
        default: null
    },
    reschedule_by: {
        type: String,
        enum: ['user', 'counselor'],
        default: null
    }
}, { timestamps: true, versionKey: false });



ScheduleSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Schedule', ScheduleSchema);