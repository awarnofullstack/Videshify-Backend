const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");


const Schema = mongoose.Schema;


const CommunityPostLikeSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'CommunityPost',
        required: true
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    versionKey: false
})


CommunityPostLikeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CommunityPostLike', CommunityPostLikeSchema);