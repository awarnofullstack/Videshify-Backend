const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentDocumentSchema = new Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    label: {
        type: String,
        default: null,
        required: false
    },
    path: {
        type: String,
        default: null,
        required: true
    },
    type: {
        type: String,
        required: false,
        default: ''
    }
},
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('StudentDocument', StudentDocumentSchema);