const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentCareerSchema = Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
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
    description: {
        type: String,
        required: true
    },
},
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('StudentResearchPrep', StudentCareerSchema);