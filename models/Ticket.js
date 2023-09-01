const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    ticketId: {
        type: Number,
        required: false
    },
    description: {
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
    conversations: [
        {
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: 'User', // Reference to the User model
                required: true
            },
            message: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
},
    {
        timestamps: true
    });


TicketSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }

    try {
        const lastTicket = await Ticket.findOne({}, {}, { sort: { 'ticketId': -1 } });

        if (lastTicket) {
            this.ticketId = lastTicket.ticketId + 1;
        } else {
            this.ticketId = 1000; // If no previous ticket exists, start at 1
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Ticket', TicketSchema);

