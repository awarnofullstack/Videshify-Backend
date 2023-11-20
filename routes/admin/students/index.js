const express = require("express");
const { body, validationResult } = require("express-validator");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { authenticateToken, authorizeRoles } = require("../../../middleware/authHandler");
const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const StudentSchoolAcademic = require("../../../models/StudentSchoolAcademic");
const Student = require("../../../models/Student");
const StudentCreativePortfolioAcademic = require("../../../models/StudentCreativePortfolioAcademic");
const StudentResearchAcademic = require("../../../models/StudentResearchAcademic");
const StudentTesting = require("../../../models/StudentTesting");
const StudentExtraCurricularActivity = require("../../../models/StudentExtraCurricularActivity");
const StudentWorkExperienceActivity = require("../../../models/StudentWorkExperienceActivity");
const StudentInterestExploreCareer = require("../../../models/StudentInterestExploreCareer");
const StudentNetworkingCareer = require("../../../models/StudentNetworkingCareer");
const StudentResearchPrepCareer = require("../../../models/StudentResearchPrepCareer");

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
    const { limit, page } = req.query;

    const query = { role: 'student' };
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        select: { password: 0, resetToken: 0, resetTokenExpiry: 0 }
    }

    if (req.query?.search) {
        query.first_name = { $regex: `^${req.query.search}`, $options: 'i' };
    }

    const data = await User.paginate(query, { ...options });

    if (!data) {
        const response = responseJson(true, data, 'No Data Found', StatusCodes.OK, []);
        return res.status(StatusCodes.OK).json(response);
    }
    const response = responseJson(true, data, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/profile', async (req, res) => {
    const { id } = req.params;

    const isStudentProfile = await Student.findOne({ user_id: id }).populate('user_id');

    if (!isStudentProfile) {
        const response = responseJson(false, {}, 'No student profile found.', StatusCodes.NOT_FOUND);
        return res.status(StatusCodes.NOT_FOUND).json(response);
    };

    const response = responseJson(true, isStudentProfile, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/academics', async (req, res) => {
    const { id } = req.params;

    const academicSchool = await StudentSchoolAcademic.find({ student_id: id }).sort({ _id: -1 });
    const academicCreative = await StudentCreativePortfolioAcademic.find({ student_id: id }).sort({ _id: -1 });
    const academicResearch = await StudentResearchAcademic.find({ student_id: id }).sort({ _id: -1 });

    const response = responseJson(true, { academicSchool, academicResearch, academicCreative }, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/testing', async (req, res) => {
    const { id } = req.params;

    const isStudentTesting = await StudentTesting.findOne({ student_id: id }).lean();

    if (!isStudentTesting) {
        const response = responseJson(false, {}, 'No student tests found.', StatusCodes.NOT_FOUND);
        return res.status(StatusCodes.NOT_FOUND).json(response);
    };

    const response = responseJson(true, isStudentTesting, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/activities', async (req, res) => {
    const { id } = req.params;

    const curricularActivity = await StudentExtraCurricularActivity.find({ student_id: id }).sort({ _id: -1 }).lean();
    const workExperienceActivity = await StudentWorkExperienceActivity.find({ student_id: id }).sort({ _id: -1 }).lean();

    const response = responseJson(true, { curricularActivity, workExperienceActivity }, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/careers', async (req, res) => {
    const { id } = req.params;

    const interest = await StudentInterestExploreCareer.findOne({ student_id: id }).lean();
    const networking = await StudentNetworkingCareer.findOne({ student_id: id }).lean();
    const researchPrep = await StudentResearchPrepCareer.findOne({ student_id: id }).lean();

    const response = responseJson(true, { interest, networking, researchPrep }, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

// add task in student 

// remove student from list
router.get('/:id/remove', async (req, res) => {
    const { id } = req.params;
    const isStudentProfile = await Student.findOne({ student: id }).deleteOne();
    const isUser = await User.findOne({ student: id }).deleteOne();

    if (!isStudentProfile) {
        const response = responseJson(false, {}, 'Failed to remove student, try again.', StatusCodes.INTERNAL_SERVER_ERROR);
        return res.status(StatusCodes.OK).json(response);
    };

    const response = responseJson(true, {}, 'Student account deleted.', 200);
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;