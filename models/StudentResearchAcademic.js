const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AcademicResearchSchema = Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    research_field: {
        type: String,
        required: true
    },
    sub_field: {
        type: String,
        required: true
    },
    advisor: {
        type: String,
        required: true
    },
    advisor_affiliation_university: {
        type: String,
        required: true
    },
    pursuing_publication: {
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
    research_paper: {
        type: String,
        required: true
    },
    research_question: {
        type: String,
        required: true
    },
},
    {
        timestamps: true
    }
);


AcademicResearchSchema.set('toJSON', { virtuals: true });

AcademicResearchSchema.virtual('researchPaperUrl').get(function () {
    if (this.research_paper) {
        return process.env.BASE_URL + '/static/' + this.research_paper;
    }
    return null;
});



module.exports = mongoose.model('AcademicResearch', AcademicResearchSchema);