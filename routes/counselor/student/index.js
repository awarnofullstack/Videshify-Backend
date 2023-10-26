const express = require("express");
const { StatusCodes } = require("http-status-codes");

const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const Student = require("../../../models/Student");
const Counselor = require("../../../models/Counselor");
const StudentInCounselor = require("../../../models/StudentInCounselor");
const StudentSchoolAcademic = require("../../../models/StudentSchoolAcademic");
const StudentTesting = require("../../../models/StudentTesting");
const StudentActivity = require("../../../models/StudentWorkExperienceActivity");

const StudentInterest = require("../../../models/StudentInterestExploreCareer");
const StudentNetworking = require("../../../models/StudentNetworkingCareer");
const StudentResearchPrep = require("../../../models/StudentResearchPrepCareer");


const StudentCurricularActivity = require("../../../models/StudentExtraCurricularActivity")
const StudentWorkExperienceActivity = require("../../../models/StudentWorkExperienceActivity")

const router = express.Router();

router.get('/all', async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        populate: ['student'],
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

    const isStudentAcademics = await StudentSchoolAcademic.findOne({ student_id: id }).lean();

    if (!isStudentAcademics) {
        const response = responseJson(false, {}, 'No student academics found.', StatusCodes.NOT_FOUND);
        return res.status(StatusCodes.NOT_FOUND).json(response);
    };

    const response = responseJson(true, isStudentAcademics, '', 200);
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

    const curricularActivity = await StudentCurricularActivity.find({ student_id: id }).sort({ _id: -1 }).lean();
    const workExperienceActivity = await StudentWorkExperienceActivity.find({ student_id: id }).sort({ _id: -1 }).lean();

    const response = responseJson(true, {curricularActivity,workExperienceActivity}, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/careers', async (req, res) => {
    const { id } = req.params;

    const interest = await StudentInterest.findOne({ student_id: id }).lean();
    const networking = await StudentNetworking.findOne({ student_id: id }).lean();
    const researchPrep = await StudentResearchPrep.findOne({ student_id: id }).lean();

    const response = responseJson(true, { interest, networking, researchPrep }, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

// add task in student 


// remove student from list
router.get('/:id/remove', async (req, res) => {
    const { id } = req.params;
    const isStudentProfile = await StudentInCounselor.findOne({ student: id }).deleteOne();

    if (!isStudentProfile) {
        const response = responseJson(false, {}, 'Failed to remove student, try again.', StatusCodes.INTERNAL_SERVER_ERROR);
        return res.status(StatusCodes.OK).json(response);
    };

    const response = responseJson(true, {}, 'Student removed now.', 200);
    return res.status(StatusCodes.OK).json(response);
});

module.exports = router;