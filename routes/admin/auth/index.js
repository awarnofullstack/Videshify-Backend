const express = require("express");
const { body, validationResult } = require("express-validator");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { authenticateToken, authorizeRoles } = require("../../../middleware/authHandler");
const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");

const router = express.Router();

const loginValidationChain = [body('email').notEmpty().isEmail().trim(),
body('password').notEmpty().isLength({ min: 8 })];

const registerValidationChain = [
    body('first_name').notEmpty().toLowerCase().withMessage('First name is required field.'),
    body('last_name').notEmpty().toLowerCase().withMessage('Last name is required field.'),
    body('email').notEmpty().isEmail().toLowerCase().trim().withMessage('Email is required field.'),
    body('phone').notEmpty().isLength({ min: 10, max: 12 }).withMessage('Phone is required field.'),
    body('password').notEmpty().isLength({ min: 8 }).withMessage('Password is required field.'),
];

router.post("/login", loginValidationChain, async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, req.body, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
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






router.post("/create", registerValidationChain, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const { password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "admin";

    const user = await User.create(req.body);

    const token = user.signJWT();
    const response = responseJson(true, { token, user }, ReasonPhrases.CREATED, StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;  