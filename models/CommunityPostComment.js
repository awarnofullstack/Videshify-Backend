const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");


const Schema = mongoose.Schema;

const CommunityPostCommentSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'CommunityPost',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    versionKey: false
});

CommunityPostCommentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CommunityPostComment', CommunityPostCommentSchema);