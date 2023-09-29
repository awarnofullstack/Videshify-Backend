const mongoose = require("mongoose");
const { english_proficiency } = require("../utils/EnumOptions");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    preferred_name: {
        type: String,
        required: false
    },
    preferred_pronouns: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'bio sexual', 'transgender'],
        required: true
    },
    date_of_birth: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: false
    },
    timezone: {
        type: String,
        required: false
    },
    meeting_availability: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    application: {
        application_cycle: {
            type: String,
            required: false
        },
        intended_major: {
            type: String,
            required: false
        },
        recommended_majors: {
            type: String,
            required: false
        },
        financial_aid_needed: {
            type: Boolean,
            default: true
        },
        hook_statement: {
            type: String,
            required: false
        }
    },
    contact: {
        country_of_current_school: String,
        phone: {
            type: Number,
            required: false
        },
        mailing_address: {
            type: String,
            required: false
        },
        countries_of_citizenship: {
            type: Array,
            required: false
        },
        countries_of_permanent_residency: {
            type: Array,
            required: false
        },
        english_proficiency: {
            type: String,
            enum: english_proficiency,
            required: false
        },
        birthplace: {
            type: String,
            required: false
        }
    }
},
    {
        timestamps: true,
    }
);


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

const Student = mongoose.model('Student', StudentSchema);
module.exports = { Student, KeyContact };