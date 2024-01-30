const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2")

const responseSchema = new Schema({
    _id: Schema.Types.ObjectId,
    sender: {
        type: String,
        enum: ['user', 'support'], // Reference to the User model
        required: true
    },
    message: {
        type: String,
        required: true
    },
    attachment: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const TicketSchema = new Schema({
    ticketId: {
        type: Number,
        required: false
    },
    subject: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in progress', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    responds: { type: [responseSchema] }
},
    {
        timestamps: true
    });


TicketSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Ticket', TicketSchema);

