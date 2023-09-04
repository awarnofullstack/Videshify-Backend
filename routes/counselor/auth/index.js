const express = require("express");
const { body, validationResult } = require("express-validator");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');




const transporter = nodemailer.createTransport({
    service: 'smtp', // e.g., Gmail
    auth: {
        user: 'your_email@example.com',
        pass: 'your_email_password',
    },
});

const { authenticateToken, authorizeRoles } = require("../../../middleware/authHandler");
const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");

const router = express.Router();

const loginValidationChain = [body('email').notEmpty().isEmail().trim(),
body('password').notEmpty().withMessage('Password is required field.')
    .isLength({ min: 8 })
    .withMessage('Password should have atleast 8 characters.')];

const resetPasswordValidationChain = [body('email').notEmpty().isEmail().trim()];

const registerValidationChain = [
    body('first_name').notEmpty().toLowerCase().withMessage('First name is required field.'),
    body('last_name').notEmpty().toLowerCase().withMessage('Last name is required field.'),
    body('email').notEmpty().isEmail().toLowerCase().trim().withMessage('Email is required field.'),
    body('phone').notEmpty().isLength({ min: 10, max: 12 }).withMessage('Phone is required field.'),
    body('password').notEmpty().withMessage('Password is required field.').isLength({ min: 8 }).withMessage('Password should have atleast 8 characters.'),
];

router.post("/login", loginValidationChain, async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.role !== 'counselor') {
        throw new Error("Invalid credentials or no user exist.");
    }

    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
        throw new Error("Invalid credentials, Try again.");
    }

    const token = user.signJWT();

    const response = responseJson(true, { token, user }, `You're logged in.`, StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);
});


router.post("/register", registerValidationChain, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const { password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "counselor";

    const user = await User.create(req.body);

    const token = user.signJWT();
    const response = responseJson(true, { token, user }, ReasonPhrases.CREATED, StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);
});


// Store reset tokens in a temporary storage (e.g., an object)
const resetTokens = {};

// Generate a reset token and email the reset link to the user
router.post('/reset-password', resetPasswordValidationChain, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const { email } = req.body;

    // Generate a unique reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    resetTokens[resetToken] = email;

    // Send an email with the reset link
    const resetLink = `https://videshify.onrender.com/reset-password/${resetToken}`;
    const mailOptions = {
        from: 'your_email@example.com',
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send('Password reset link sent to your email.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to send reset email.');
    }
});

// Handle password reset
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const email = resetTokens[token];
    if (!email) {
        return res.status(400).send('Invalid or expired reset token.');
    }

    // Hash the new password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database (implement this part)

    // Delete the used reset token
    delete resetTokens[token];

    res.send('Password reset successful.');
});


module.exports = router;  