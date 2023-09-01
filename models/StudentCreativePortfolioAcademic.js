const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AcademicCreativePortfolioSchema = Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    portfolio_name: {
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
    program_provider: {
        type: String,
        required: true
    },
    doc: {
        type: String,
        required: false
    }
},
    {
        timestamps: true
    }
);


module.exports = mongoose.model('AcademicCreative', AcademicCreativePortfolioSchema);