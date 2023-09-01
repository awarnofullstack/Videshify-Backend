const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentCounselorSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'bio sexual', 'transgender'],
        required: true
    },
    high_school_name: {
        type: String,
        required: true
    },
    degree_pursuing: {
        type: String,
        required: true
    },
    high_school_name: {
        type: String,
        required: true
    },
    organization_type: {
        type: String,
        enum: ['individual', 'agency'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    education: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    number_students_admitted: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    services_provided: {
        type: Array,
        required: false,
        default: []
    },
    intro_video: {
        type: String,
        default: null,
        required: false
    },
    past_projects:{
        
    },
    bank_account_details: {
        bank_name: {
            type: String,
            required: true,
        },
        account_no: {
            type: Number,
            required: true,
        },
        ifsc_code: {
            type: String,
            required: true,
        },
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('StudentCounselor', StudentCounselorSchema);