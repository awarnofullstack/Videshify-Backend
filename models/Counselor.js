const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");
const StudentInCounselor = require("./StudentInCounselor");
const Schedule = require("./Schedule");

const CounselorSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    age: {
        type: Number,
        required: false
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'bio sexual', 'transgender'],
        required: false
    },
    high_school_name: {
        type: String,
        required: false
    },
    degree_pursuing: {
        type: String,
        required: false
    },
    organization_type: {
        type: String,
        enum: ['individual', 'agency'],
        required: true
    },
    agency_name: {
        type: String,
        required: true
    },
    agency_email: {
        type: String,
        required: true
    },
    education: {
        type: String,
        required: false
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
    profile: String,
    origin_country: {
        type: String,
        required: false
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
    });

CounselorSchema.plugin(mongoosePaginate);


// virtuals 
CounselorSchema.set('toJSON', { virtuals: true });
CounselorSchema.virtual('profileUrl').get(function () {
    return this.profile ? `${process.env.BASE_URL}/static/${this.profile}` : null;
});


CounselorSchema.methods.getStudentsCount = async function () {
    return await StudentInCounselor.findOne({ counselor: this._id }).countDocuments();
}

CounselorSchema.methods.getSessionsCount = async function () {
    return await Schedule.findOne({ counselor: this._id }).countDocuments();
}


module.exports = mongoose.model('Counselor', CounselorSchema);