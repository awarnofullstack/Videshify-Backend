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

router.post("/login", loginValidationChain, async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.role !== 'student') {
        throw new Error("Invalid credentials or no user exist.");
    }

    const verifyPassword = await bcrypt.compare(password, user.password);

    if (!verifyPassword) {
        throw new Error("Invalid credentials, Try again.");
    }
    const token = user.signJWT();

    const hasProfile = await Student.findOne({ user_id: user.id }).countDocuments();

    const eligibility = {
        isApproved: user.approved,
        isCompleted: hasProfile ? true : false,
    }

    const response = responseJson(true, { token, user, eligibility }, `You're logged in.`, StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);
});


router.post("/register/email", registerEmailValidationChain, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const { email } = req.body;

    const otp = generate(5);
    const user = await User.findOne({ email });

    if (user) {
        throw Error("Email address already exist with another account.");
    }
    // user.addResetToken(otp);
    await ResetToken.create({ entity: email, resetToken: otp, resetTokenExpiry: Date.now() })

    const mailOptions = {
        to: email,
        subject: 'Email verification otp',
        html: "../emails/views/verification-otp.ejs",
    };

    const options = { otp }

    await sendMailAsync(mailOptions, options);

    const response = responseJson(true, {}, 'OTP is sent successfuly.', StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);
});


router.post("/otp/verification", verificationOtpValidationChain, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const { email, otp } = req.body;


    console.log(email);
    const isUser = await User.findOne({ email });

    console.log(isUser);

    if (isUser) {
        throw new Error('Account already exist.');
    }

    const isConfirmed = await ResetToken.findOne({ entity: email, resetToken: otp });

    if (!isConfirmed) {
        const response = responseJson(false, null, 'Invalid or expired reset token.', StatusCodes.BAD_REQUEST, []);
        return res.status(StatusCodes.BAD_REQUEST).json(response);
    }

    let user = await User.create({ email, role: 'student', approved: true });

    const token = user.signJWT()
    if (!user) {
        const response = responseJson(false, user, 'Failed to register user', StatusCodes.CREATED, [])
        return res.status(StatusCodes.CREATED).json(response);
    }
    await isConfirmed.deleteOne();

    const response = responseJson(true, { token, user }, 'Email is registered successfuly.', StatusCodes.CREATED, [])
    return res.status(StatusCodes.CREATED).json(response);
});


router.post("/register/basic", [registerValidationChain, authenticateToken, authorizeRoles('student')], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    await User.findOne({ _id: req.user._id }).updateOne({ ...req.body });
    const modUser = await User.findOne({ _id: req.user._id });
    const response = responseJson(true, modUser, 'User basic detail completed.', StatusCodes.OK, [])
    return res.status(StatusCodes.OK).json(response);
});

router.post("/change/password", [passwordValidationChain, authenticateToken, authorizeRoles('student')], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOne({ _id: req.user._id }).updateOne({ password: hashedPassword });

    const modUser = await User.findOne({ _id: req.user._id });

    const response = responseJson(true, modUser, 'Password changed successfuly.', StatusCodes.OK, [])
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;  