const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const Schema = mongoose.Schema;

const CommunityPostSaveSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'CommunityPost',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});


CommunityPostSaveSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('CommunityPostSave', CommunityPostSaveSchema);