const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentWorkExperienceActivitySchema = Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    internship_title: {
        type: String,
        required: true
    },
    industry: {
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
    program_provider: {
        type: String,
        required: true
    },
    position_title: {
        type: String,
        required: true
    },
    application_deadline: {
        type: Date,
        required: true
    },
},
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('StudentWorkExperienceActivity', StudentWorkExperienceActivitySchema);