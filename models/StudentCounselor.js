const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");
const StudentInCounselor = require("./StudentInCounselor");
const Schedule = require("./Schedule");

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
    organization_type: {
        type: String,
        enum: ['individual', 'agency'],
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
    origin_country: {
        type: String,
        required: true
    },
    profile: {
        type: String,
        default: null
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

    },
    averageRating: Number,
    numberOfReviews: Number
},
    {
        timestamps: true
    }
);

StudentCounselorSchema.plugin(mongoosePaginate);


// virtuals 
StudentCounselorSchema.set('toJSON', { virtuals: true });
StudentCounselorSchema.virtual('profileUrl').get(function () {
    return this.profile ? `${process.env.BASE_URL}/static/${this.profile}` : null;
});


StudentCounselorSchema.methods.getStudentsCount = async function () {
    return await StudentInCounselor.findOne({ counselor: this._id }).countDocuments();
}

StudentCounselorSchema.methods.getSessionsCount = async function () {
    return await Schedule.findOne({ counselor: this._id }).countDocuments();
}


module.exports = mongoose.model('StudentCounselor', StudentCounselorSchema);