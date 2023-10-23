const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentActivitySchema = Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activity_title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    organization_name: {
        type: String,
        required: true
    },
    time_of_participation: {
        type: Date,
        required: true
    },
    position_leadership: {
        type: String,
        required: true
    },
    school_year: {
        type: Number,
        required: true
    },
    weeks_per_year: {
        type: Number,
        required: true
    },
    hours_per_week: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status : {
        type: String,
        enum : ['planned', 'progress', 'completed'],
        default: 'planned',
    }
},
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('StudentCurricularActivity', StudentActivitySchema);