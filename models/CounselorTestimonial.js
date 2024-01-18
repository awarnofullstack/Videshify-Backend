const mongoose = require("mongoose");
const Schema = mongoose.Schema
const mongoosePaginate = require("mongoose-paginate-v2")


const CounselorTestimonialSchema = new Schema({
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: false
    },
    university: {
        type: String,
        required: false
    },
    youtube_link: {
        type: String,
        required: false
    },
}, { timestamps: true, versionKey: false });


CounselorTestimonialSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CounselorTestimonial', CounselorTestimonialSchema);