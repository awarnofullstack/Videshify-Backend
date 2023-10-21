const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const TaskSchema = new Schema({
    _id: Schema.Types.ObjectId,
    label: String,
    due_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['due', 'done'],
        default: 'due'
    }
})

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
    description: {
        type: String,
        default: ''
    },
    logs: {
        type: Array,
    },
    task: {
        type: [TaskSchema],
    },
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    },
    start_date: {
        type: Date,
        default: new Date()
    },
    end_date: {
        type: Date,
        required: true
    },
    test_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['planned', 'progress', 'completed'],
        default: 'planned',
    }
},
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('StudentTesting', StudentTestingSchema);