const express = require("express");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const moment = require("moment");

const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const Student = require("../../../models/Student");
const StudentCounselor = require("../../../models/StudentCounselor");
const StudentInCounselor = require("../../../models/StudentInCounselor");
const StudentSchoolAcademic = require("../../../models/StudentSchoolAcademic");
const StudentCreativePortfolioAcademic = require("../../../models/StudentCreativePortfolioAcademic");
const StudentResearchAcademic = require("../../../models/StudentResearchAcademic");
const StudentTesting = require("../../../models/StudentTesting");

const StudentInterest = require("../../../models/StudentInterestExploreCareer");
const StudentNetworking = require("../../../models/StudentNetworkingCareer");
const StudentResearchPrep = require("../../../models/StudentResearchPrepCareer");


const StudentCurricularActivity = require("../../../models/StudentExtraCurricularActivity")
const StudentWorkExperienceActivity = require("../../../models/StudentWorkExperienceActivity");
const Schedule = require("../../../models/Schedule");

const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

router.get('/all', async (req, res) => {

    const { limit, page, search } = req.query;

    const options = {
        limit,
        page,
    }

    const orConditions = [];

    const query = { counselor: new ObjectId(req.user._id) };


    if (search) {
        orConditions.push(
            { "student.name": { $regex: search, $options: 'i' } }
        )
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
    }

    const students = StudentInCounselor.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'student',
                foreignField: '_id',
                as: 'student',
                pipeline: [
                    {
                        $addFields: { name: { $concat: ["$first_name", " ", "$last_name"] } }
                    },
                    {
                        $project: { first_name: 1, last_name: 1, role: 1, createdAt: 1, name: 1 }
                    }
                ]
            }
        },
        {
            $unwind: "$student"
        },
        {
            $match: query
        }
    ])

    const data = await StudentInCounselor.aggregatePaginate(students, options);

    if (!data) {
        const response = responseJson(true, data, 'No Data Found', StatusCodes.OK, []);
        return res.status(StatusCodes.OK).json(response);
    }
    const response = responseJson(true, data, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.get("/tile", async (req, res) => {
    const recentWeek = moment().subtract(7, 'days')

    const totalStudents = await StudentInCounselor.find({ counselor: new ObjectId(req.user._id) }).countDocuments();
    const RecentAdded = await StudentInCounselor.find({ createdAt: { $gte: recentWeek }, counselor: new ObjectId(req.user._id) }).countDocuments();

    const totalUpcomings = await Schedule.find({ start_time: { $gte: new Date() }, counselor: new ObjectId(req.user._id) }).countDocuments();
    const response = responseJson(true, { totalStudents, RecentAdded, totalUpcomings }, '', 200);
    return res.status(200).json(response);
});

router.get('/:id/profile', async (req, res) => {
    const { id } = req.params;

    const isStudentProfile = await Student.findOne({ user_id: id }).populate({ path: 'user_id', select: { password: 0, email: 0, phone: 0, resetToken: 0, resetTokenExpiry: 0, approved: 0 } });

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

    const isStudentTesting = await StudentTesting.find({ student_id: id }).sort({ _id: -1 }).lean();

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

    const response = responseJson(true, { curricularActivity, workExperienceActivity }, '', 200);
    return res.status(StatusCodes.OK).json(response);
});

router.get('/:id/careers', async (req, res) => {
    const { id } = req.params;

    const interest = await StudentInterest.find({ student_id: id }).sort({ _id: -1 }).lean();
    const networking = await StudentNetworking.find({ student_id: id }).sort({ _id: -1 }).lean();
    const researchPrep = await StudentResearchPrep.find({ student_id: id }).sort({ _id: -1 }).lean();

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