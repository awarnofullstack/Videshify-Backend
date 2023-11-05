const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const CommunityFollowSchema = new Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true,
    versionKey: false
});


CommunityFollowSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CommunityFollow', CommunityFollowSchema);