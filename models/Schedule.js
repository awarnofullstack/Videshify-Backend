const mongoose = require("mongoose");
const Schema = mongoose.Schema



const ScheduleSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    invite_link: {
        type: String,
        required: true
    },
    assigned_to: {
        type: String,
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'rejected', 'complete'],
        default: 'pending'
    },
    description: {
        type: String,
        required: false
    }

}, { timestamps: true, versionKey: false });





module.exports = mongoose.model('Schedule', ScheduleSchema);