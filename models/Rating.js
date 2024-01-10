const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")

const RatingSchema = new mongoose.Schema({
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rateBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  reviewText: String
});

RatingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Rating", RatingSchema);
