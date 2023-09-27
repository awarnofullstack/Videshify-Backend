const express = require("express");
const { body, validationResult } = require("express-validator");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const transporter = require("../../utils/emailTransport");
const { sendMailAsync } = require("../../utils/emailTransport");

const responseJson = require("../../utils/responseJson");
const User = require("../../models/User");
const fs = require("fs");
const ejs = require("ejs");

const router = express.Router();
const resetPasswordValidationChain = [body('email').notEmpty().isEmail().trim()];

// Generate a reset token and email the reset link to the user
router.post('/reset-password', resetPasswordValidationChain, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const { email } = req.body;


    const resetToken = crypto.randomBytes(20).toString('hex');

    console.log(process.env.DB_URL);
    const isUser = await User.findOne({ email : "abhisheksinghk30@gmail.com" });

    console.log(isUser);
    if (!isUser) {
        throw new Error('Email address is not valid.');
    }

    isUser.updateOne({
        resetToken,
        resetTokenExpiry: Date.now(),
    })

    // Send an email with the reset link
    const mailOptions = {
        to: email,
        subject: 'Password Reset',
        html: "../emails/reset-link.ejs",
    };

    const options = { resetToken }

    try {
        await sendMailAsync(mailOptions, options);
        const response = responseJson(true, null, 'Password reset link sent to your email.', 200, []);
        return res.status(200).json(response);
    } catch (error) {
        const response = responseJson(false, null, 'Failed to send reset email.', 500, []);
        console.log(error);
        return res.status(500).json(response);
    }

});

// Handle password reset
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const tokenUser = await User.findOne({ resetToken: token });

    if (!tokenUser) {
        return res.render('reset-password', { token, errorMessage: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await tokenUser.updateOne({
        password: hashedPassword,
        token: null
    });

    // const response = responseJson(true, null, 'Password has changed successfuly', StatusCodes.OK, []);
    return res.render('reset-password-confirmed', { message: 'Password has changed successfuly.' });

    return res.status(StatusCodes.OK).json(response);
});

module.exports = router;