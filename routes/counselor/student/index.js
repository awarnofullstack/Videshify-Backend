const express = require("express");
const { StatusCodes } = require("http-status-codes");

const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const Student = require("../../../models/Student");
const Counselor = require("../../../models/Counselor");
const StudentInCounselor = require("../../../models/StudentInCounselor");

const router = express.Router();

router.get('/all', async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        populate: 'student',
        query: { counselor: req.user.id }
    }

    const data = await StudentInCounselor.paginate({}, { ...options });

    if (!data) {
        const response = responseJson(true, data, 'No Data Found', StatusCodes.OK, []);
        return res.status(StatusCodes.OK).json(response);
    }
    const response = responseJson(true, data, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


router.get('/:id/profile', async (req, res) => {
    const { id } = req.params;

    const isStudentProfile = await Student.findOne({ user_id: id }).populate('user_id').lean();

    if (!isStudentProfile) {
        const response = responseJson(false, {}, 'No student profile found.', StatusCodes.NOT_FOUND);
        return res.status(StatusCodes.NOT_FOUND).json(response);
    };

    const response = responseJson(true, isStudentProfile, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/testing', async (req, res) => {
    const { id } = req.params;

    const isStudentProfile = await Student.findOne({ user_id: id }).lean();

    if (!isStudentProfile) {
        const response = responseJson(false, {}, 'No student profile found.', StatusCodes.NOT_FOUND);
        return res.status(StatusCodes.NOT_FOUND).json(response);
    };

    const response = responseJson(true, isStudentProfile, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/academics', async (req, res) => {
    const { id } = req.params;

    const isStudentProfile = await Student.findOne({ user_id: id }).lean();

    if (!isStudentProfile) {
        const response = responseJson(false, {}, 'No student profile found.', StatusCodes.NOT_FOUND);
        return res.status(StatusCodes.NOT_FOUND).json(response);
    };

    const response = responseJson(true, isStudentProfile, '', 200);
    return res.status(StatusCodes.OK).json(response);
});


router.get('/:id/activities', async (req, res) => {
    const { id } = req.params;

    const isStudentProfile = await Student.findOne({ user_id: id }).lean();

    if (!isStudentProfile) {
        const response = responseJson(false, {}, 'No student profile found.', StatusCodes.NOT_FOUND);
        return res.status(StatusCodes.NOT_FOUND).json(response);
    };

    const response = responseJson(true, isStudentProfile, '', 200);
    return res.status(StatusCodes.OK).json(response);
});


router.get('/:id/careers', async (req, res) => {
    const { id } = req.params;

    const isStudentProfile = await Student.findOne({ user_id: id }).lean();

    if (!isStudentProfile) {
        const response = responseJson(false, {}, 'No student profile found.', StatusCodes.NOT_FOUND);
        return res.status(StatusCodes.NOT_FOUND).json(response);
    };

    const response = responseJson(true, isStudentProfile, '', 200);
    return res.status(StatusCodes.OK).json(response);
});




// add task in student 

module.exports = router;