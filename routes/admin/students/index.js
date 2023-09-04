const express = require("express");
const { body, validationResult } = require("express-validator");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { authenticateToken, authorizeRoles } = require("../../../middleware/authHandler");
const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const StudentSchoolAcademic = require("../../../models/StudentSchoolAcademic");

const router = express.Router();
const registerValidationChain = [
    body('first_name').notEmpty().toLowerCase().withMessage('First name is required field.'),
    body('last_name').notEmpty().toLowerCase().withMessage('Last name is required field.'),
    body('email').notEmpty().isEmail().toLowerCase().trim().withMessage('Email is required field.'),
    body('phone').notEmpty().isLength({ min: 10, max: 12 }).withMessage('Phone is required field.'),
    body('password').notEmpty().isLength({ min: 8 }).withMessage('Password is required field.'),
];


router.post("/create", registerValidationChain, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const { password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "student";

    const user = await User.create(req.body);

    const token = user.signJWT();
    const response = responseJson(true, { token, user }, ReasonPhrases.CREATED, StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/list', async (req, res) => {
    const currentPage = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    const entries = await User.findStudents().countDocuments(filter);
    const totalPages = Math.ceil(entries / limit);

    const data = await User.findStudents(filter).limit(limit).skip((currentPage - 1) * limit);
    const response = responseJson(true, { data, currentPage, totalPages, entries }, 'student list fetched.', StatusCodes.OK);
    res.status(StatusCodes.OK).json(response);
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const data = await User.findStudentByID(id);
    const response = responseJson(true, data, '', 200, []);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/academics', async (req, res) => {
    const id = req.params.id;
    const data = await StudentSchoolAcademic.findStudentByID(id);
    const response = responseJson(true, data, '', 200, []);
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;