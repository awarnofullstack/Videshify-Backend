const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2")
const aggregatePaginate = require("mongoose-aggregate-paginate-v2")

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    issuedBy: {
        type: String,
        enum: ['system', 'user'],
        required: true
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

NotificationSchema.plugin(mongoosePaginate)
NotificationSchema.plugin(aggregatePaginate)

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
