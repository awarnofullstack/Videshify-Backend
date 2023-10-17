const mongoose = require("mongoose");


const ImageSchema = new mongoose.Schema({
    name: String,
    path: String,
    entity: String,
    entity_id: mongoose.Schema.Types.ObjectId,
    type: String
}, { timestamps: true });



module.exports = mongoose.model('Image', ImageSchema);