const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")

const ServiceSchema = new Schema({
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    contents: {
        type: Array,
        required: true
    },
    cover_photo: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true

    },
    price: {
        type: Number,
        required: true

    },
    status: {
        type: Boolean,
        default: true
    },
    averageRating: Number,
    numberOfReviews: Number
},
    {
        timestamps: true,
        versionKey: false
    });

ServiceSchema.plugin(mongoosePaginate);
ServiceSchema.plugin(aggregatePaginate);

// virtuals 
ServiceSchema.set('toJSON', { virtuals: true });
ServiceSchema.virtual('thumbnail').get(function () {
    return this.cover_photo ? `${process.env.BASE_URL}/static/${this.cover_photo}` : null;
});

module.exports = mongoose.model('Service', ServiceSchema);