const express = require("express");
const { body, validationResult } = require("express-validator");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const bcrypt = require("bcrypt");


const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const Counselor = require("../../../models/Counselor");

const router = express.Router();

const loginValidationChain = [body('email').notEmpty().isEmail().trim(),
body('password').notEmpty().withMessage('Password is required field.')
    .isLength({ min: 8 })
    .withMessage('Password should have atleast 8 characters.')];


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

    const hasProfile = await Counselor.findOne({ user_id: user.id }).countDocuments();

    const eligiblity = {
        isApproved: user.approved,
        isCompleted: hasProfile ? true : false,
    }

    const response = responseJson(true, { token, user, eligibility }, `You're logged in.`, StatusCodes.OK);
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

module.exports = router;  