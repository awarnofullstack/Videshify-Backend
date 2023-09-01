const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AcademicSchoolSchema = Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    class_size: {
        type: Number,
        required: true
    },
    target_class_rank: {
        type: Number,
        required: true
    },
    gpa_scale: {
        type: Number,
        required: true
    },
    target_gpa: {
        type: Number,
        required: true
    },
    actual_gpa: {
        type: Number,
        required: true
    },
    target_cumulative_gpa: {
        type: Number,
        required: true
    },
    cumulative_gpa: {
        type: Number,
        required: true
    },
    gpa_weighting: {
        type: Number,
        required: true
    },
},
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('AcademicSchool', AcademicSchoolSchema);