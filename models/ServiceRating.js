const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2")

const ServiceRatingSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  rateBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  reviewText: String
});

ServiceRatingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("ServiceRating", ServiceRatingSchema);
