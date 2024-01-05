const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2")

const ContactSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: Number,
    },
    message: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false
});



ContactSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Contact', ContactSchema);