const express = require("express");
const moment = require("moment")

const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");
const validate = require("../../../utils/validateHandler");

const CounselorMember = require("../../../models/CounselorMember");
const Schedule = require("../../../models/Schedule");

const { makeMoved } = require("../../../utils/fileUpload");
const { createMeeting } = require("../../../utils/createMeeting");
const { genZoomToken } = require("../../../middleware/zoomAuthToken");
const { default: mongoose } = require("mongoose");

const reScheduleValidationChain = [
    body('reschedule_at').notEmpty().trim().withMessage('Re-schedule date & time is required field.'),
];

const assignMemberValidationChain = [
    body('member_id').notEmpty().trim().withMessage('Member id is required field.'),
];

const ObjectId = mongoose.Types.ObjectId;

router.get("/", async (req, res) => {

    const { limit, page, date } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }, { path: 'counselor', select: 'first_name last_name _id role' }, { path: 'student', select: 'first_name last_name _id role' }]
    }

    const query = {}

    if (date && date !== 'null' && date !== '' && date !== 'Invalid date') {
        const momentDate = moment(date);
        const startOfDay = momentDate.add(1, 'day');

        query.start_time = {
            $gte: date,
            $lte: startOfDay,
        };
    }

    const members = await Schedule.paginate(query, options);
    const response = responseJson(true, members, '', 200);
    return res.status(200).json(response);
});


router.get("/tile", async (req, res) => {
    const recentWeek = moment().subtract(7, 'days')

    const totalBookings = await Schedule.find().countDocuments();
    const RecentAdded = await Schedule.find({ createdAt: { $gte: recentWeek } }).countDocuments();

    const totalUpcomings = await Schedule.find({ start_time: { $gte: new Date() } }).countDocuments();
    const response = responseJson(true, { totalBookings, RecentAdded, totalUpcomings }, '', 200);
    return res.status(200).json(response);
});

router.get("/past", async (req, res) => {

    const { limit, page, date } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }, { path: 'counselor', select: 'first_name last_name _id role' }, { path: 'student', select: 'first_name last_name _id role' }]
    }

    const query = {};
    query.start_time = { $lt: new Date() }

    if (date && date !== 'null' && date !== '' && date !== 'Invalid date') {
        const momentDate = moment(date);
        const startOfDay = momentDate.add(1, 'day');

        query.start_time = {
            $gte: date,
            $lte: startOfDay,
        };
    }

    const members = await Schedule.paginate(query, options);
    const response = responseJson(true, members, '', 200);
    return res.status(200).json(response);
});

router.get("/upcoming", async (req, res) => {

    const { limit, page, date } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }, { path: 'counselor', select: 'first_name last_name _id role' }, { path: 'student', select: 'first_name last_name _id role' }]
    }

    const query = {};
    query.start_time = { $gte: new Date() }


    if (date && date !== 'null' && date !== '' && date !== 'Invalid date') {
        const momentDate = moment(date);
        const startOfDay = momentDate.add(1, 'day');

        query.start_time = {
            $gte: date,
            $lt: startOfDay,
        };
    }

    const members = await Schedule.paginate(query, options);
    const response = responseJson(true, members, '', 200);
    return res.status(200).json(response);
});

router.get("/:id/show", async (req, res) => {
    const { id } = req.params;
    const schedule = await Schedule.findOne({ _id: id }).populate([{ path: 'assigned_to', select: ['name', 'profile'] }, { path: 'counselor', select: 'first_name last_name _id role' }, { path: 'student', select: 'first_name last_name _id role' }]);
    const response = responseJson(true, schedule, '', 200);
    return res.status(200).json(response);
});


router.get("/re-schedules", async (req, res) => {

    const { limit, page, date } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] },{path: 'counselor', select: 'first_name last_name _id role'},{path: 'student', select: 'first_name last_name _id role'}]
    }

    const query = { is_reschedule: true };
    query.start_time = { $gte: new Date() }
    query.reschedule_at = { $gte: new Date() }

    if (date && date !== 'null' && date !== '' && date !== 'Invalid date') {
        const momentDate = moment(date);
        const startOfDay = momentDate.add(1, 'day');

        query.start_time = {
            $gte: date,
            $lte: startOfDay,
        };
    }

    const schedules = await Schedule.paginate(query, options);
    const response = responseJson(true, schedules, '', 200);
    return res.status(200).json(response);
});


module.exports = router;