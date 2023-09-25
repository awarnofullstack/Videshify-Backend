const mongoose = require("mongoose");

const ResetTokenSchema = new mongoose.Schema(
    {
        entity: {
            type: String,
            default: null,
        },
        resetToken: {
            type: String,
            default: null,
        },
        resetTokenExpiry: {
            type: Date,
            expires: '10m',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ResetToken", ResetTokenSchema);
