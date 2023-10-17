const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AcademicSchoolSchema = Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    label: {
        type: String,
        required: true
    },
    class_size: {
        type: Number,
        required: true
    },
    target_class_rank: {
        type: String,
        required: true
    },
    actual_class_rank: {
        type: String,
        required: true
    },
    gpa_scale: {
        type: String,
        required: true
    },
    target_gpa: {
        type: String,
        required: true
    },
    actual_gpa: {
        type: String,
        required: true
    },
    target_cumulative_gpa: {
        type: String,
        required: true
    },
    cumulative_gpa: {
        type: String,
        required: true
    },
    gpa_weighting: {
        type: String,
        required: true
    },
    transcript: {
        type: String,
        required: false
    }
},
    {
        timestamps: true,
    }
);

AcademicSchoolSchema.set('toJSON', { virtuals: true });

AcademicSchoolSchema.virtual('transcriptUrl').get(function () {
    console.log(this.transcript);
    if (this.transcript) {
        return process.env.BASE_URL + '/static/' + this.transcript;
    }
    return 'null';
});


module.exports = mongoose.model('AcademicSchool', AcademicSchoolSchema);