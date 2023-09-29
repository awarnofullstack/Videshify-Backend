const express = require("express");
const { body, validationResult } = require("express-validator");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const bcrypt = require("bcrypt");
const { authenticateToken, authorizeRoles } = require("../../../middleware/authHandler");


const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const { Student } = require("../../../models/Student");
const ResetToken = require("../../../models/ResetToken");
const generate = require("../../../utils/generateOTP");
const { sendMailAsync } = require("../../../utils/emailTransport");

const router = express.Router();

const loginValidationChain = [body('email').notEmpty().isEmail().trim(),
body('password').notEmpty().withMessage('Password is required field.')
    .isLength({ min: 8 })
    .withMessage('Password should have atleast 8 characters.')];


const registerEmailValidationChain = [
    body('email').notEmpty().isEmail().toLowerCase().trim().withMessage('Email is required field.'),
];

const verificationOtpValidationChain = [
    body('email').notEmpty().isEmail().toLowerCase().trim().withMessage('Email is required field.'),
    body('otp').notEmpty().trim().withMessage('Otp is required field.'),
];


const registerValidationChain = [
    body('first_name').notEmpty().toLowerCase().withMessage('First name is required field.'),
    body('last_name').notEmpty().toLowerCase().withMessage('Last name is required field.'),
];
const passwordValidationChain = [
    body('password').notEmpty().withMessage('First name is required field.'),
];

router.get("/show", async (req, res) => {

    const data = await Student.findOne({ user_id: req.user._id });
    if (!data) {
        throw new Error("Failed to find the profile.");
    }

    const response = responseJson(true, data, ``, StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);
});


router.post("/complete", async (req, res) => {

    const isCompleted = await Student.findOne({ user_id: req.user._id });
    if (isCompleted) {
        await Student.findOne({ _id: req.user._id }).updateOne({ ...req.body });
        const response = responseJson(true, isCompleted, 'Profile is updated.', StatusCodes.OK, [])
        return res.status(StatusCodes.OK).json(response);
    }

    await Student.create({ ...req.body, user_id: req.user._id });
    const response = responseJson(true, isCompleted, 'Profile is completed.', StatusCodes.OK, [])
    return res.status(StatusCodes.OK).json(response);

});




module.exports = router;  