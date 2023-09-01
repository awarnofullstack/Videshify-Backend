const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const WalletSchema = new Schema({
    counselor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Wallet', WalletSchema);