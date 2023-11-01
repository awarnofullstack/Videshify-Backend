const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2")

const BlogSchema = new Schema({
    title: String,
    description: String,
    primary_image: String,
    secondary_image: String,
    tags: [String],
    category: String,
}, {
    timestamps: true,
    versionKey: false,
});

BlogSchema.plugin(mongoosePaginate);

BlogSchema.set('toJSON', {
    virtuals: true
})


BlogSchema.virtual('thumbnail').get(function () {
    return this.primary_image ? process.env.host : null;
});

BlogSchema.virtual('cover image').get(function () {
    return this.secondary_image ? process.env.host : null;
});

module.exports = mongoose.model('Blog', BlogSchema);