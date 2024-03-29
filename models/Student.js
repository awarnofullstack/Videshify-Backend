const mongoose = require("mongoose");
const { english_proficiency } = require("../utils/EnumOptions");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")

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
    profile: {
        type: String
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



StudentSchema.plugin(mongoosePaginate);
StudentSchema.plugin(aggregatePaginate);

StudentSchema.set('toJSON', { virtuals: true });

StudentSchema.virtual('profileUrl').get(function () {
    return this.profile ? `${process.env.BASE_URL}/static/${this.profile}` : null;
})

module.exports = mongoose.model('Student', StudentSchema);