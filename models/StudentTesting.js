const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentTestingSchema = Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    test_type: {
        type: String,
        enum: ['official', 'mock'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    test_date: {
        type: Date,
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


module.exports = mongoose.model('StudentTesting', StudentTestingSchema);