const mongoose = require("mongoose");
const { english_proficiency } = require("../utils/EnumOptions");
const Schema = mongoose.Schema;

const StudentKeyContactSchema = new Schema({
    student_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    relationship: {
        type: String,
        required: true
    },
    english_proficiency: {
        type: String,
        enum: english_proficiency,
        required: true
    },
});


const KeyContact = mongoose.model('KeyContact', StudentKeyContactSchema);