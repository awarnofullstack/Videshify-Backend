const mongoose = require("mongoose");
// const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");


const Schema = mongoose.Schema;

const contentSchema = new Schema({
    type: {
        type: String,
    },
    extention: {
        type: String,
    },
    url: {
        type: String,
    },
    size: {
        type: Number
    }
});

const CommunityPostSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    content: {
        type: contentSchema,
        required: false
    },
    category: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    versionKey: false
});

contentSchema.set('toJSON', { virtuals: true });
contentSchema.virtual('docUrl').get(function () {
    if (this.url) {
        return process.env.BASE_URL + '/static/' + this.url;
    }
    return null;
});

// CommunityPostSchema.plugin(mongoosePaginate);
CommunityPostSchema.plugin(aggregatePaginate);

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);