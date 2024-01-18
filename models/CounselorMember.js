const mongoose = require("mongoose");
const Schema = mongoose.Schema
const mongoosePaginate = require("mongoose-paginate-v2")


const CounselorMemberSchema = new Schema({
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profile: {
        type: String,
        required: false
    },
    experience: {
        type: Number,
        required: true
    },
    services: {
        type: Array,
        required: true,
        default: []
    }
}, { timestamps: true, versionKey: false });


CounselorMemberSchema.plugin(mongoosePaginate);


CounselorMemberSchema.set('toJSON', { virtuals: true });

CounselorMemberSchema.virtual('profileUrl').get(function () {
    if (this.profile) {
        return process.env.BASE_URL + '/static/' + this.profile;
    }
    return null;
})

module.exports = mongoose.model('CounselorMember', CounselorMemberSchema);