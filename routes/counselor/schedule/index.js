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
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }]
    }

    const query = { counselor: new ObjectId(req.user._id) }

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

    const totalBookings = await Schedule.find({ counselor: new ObjectId(req.user._id) }).countDocuments();
    const RecentAdded = await Schedule.find({ createdAt: { $gte: recentWeek }, counselor: new ObjectId(req.user._id) }).countDocuments();

    const totalUpcomings = await Schedule.find({ start_time: { $gte: new Date() }, counselor: new ObjectId(req.user._id) }).countDocuments();
    const response = responseJson(true, { totalBookings, RecentAdded, totalUpcomings }, '', 200);
    return res.status(200).json(response);
});

router.get("/past", async (req, res) => {

    const { limit, page, date } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }]
    }

    const query = { counselor: new ObjectId(req.user._id) };
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
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }]
    }

    const query = { counselor: req.user._id };
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
    const schedule = await Schedule.findOne({ _id: id }).populate({ path: 'assigned_to', select: ['name', 'profile', 'email'] });
    const response = responseJson(true, schedule, '', 200);
    return res.status(200).json(response);
});


router.put("/:id", async (req, res) => {
    const { id } = req.params;

    const schedule = await Schedule.findOne({ _id: id });

    if (!schedule) {
        throw new Error('You are trying to update non-existing document.');
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true });

    const response = responseJson(true, updatedSchedule, 'Schedule updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const schedule = await Schedule.findOne({ _id: id });

    if (!schedule) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await schedule.deleteOne();
    const response = responseJson(true, schedule, 'Schedule deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


// assign member to schedule 
router.put("/:id/assign", assignMemberValidationChain, genZoomToken, async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const { id } = req.params;

    const schedule = await Schedule.findOne({ _id: id });

    if (!schedule) {
        throw new Error('You are trying to assign member to non-existing schedule.');
    }

    const member = await CounselorMember.findOne({ _id: req.body.member_id });
    if (!member) {
        throw new Error('Member id is not valid.');
    }

    const { duration, topic, start_time } = schedule

    const createLink = await createMeeting({ duration, topic, start_time, token: req.zoom.access_token });

    console.log("createLink", createLink);

    const updatedSchedule = await Schedule.findByIdAndUpdate(id,
        {
            $set: {
                assigned_to: req.body.member_id,
                invite_link: createLink.join_url,
                start_time: createLink.start_time,
                duration: createLink.duration,
                meeting_id: createLink.id
            }
        },
        { new: true }
    );

    const response = responseJson(true, updatedSchedule, 'Member assigned to schedule successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


router.get("/re-schedules", async (req, res) => {

    const { limit, page, date } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: "student" }]
    }

    const query = { counselor: req.user._id, is_reschedule: true };
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

router.put("/:id/re-schedule", [reScheduleValidationChain, validate], async (req, res) => {
    const { id } = req.params;

    const schedule = await Schedule.findOne({ _id: id });

    if (!schedule) {
        throw new Error('You are trying to update non-existing document.');
    }
    const updatedSchedule = await Schedule.findByIdAndUpdate(id, { $set: { ...req.body, is_reschedule: true, reschedule_by: 'counselor' } }, { new: true });

    const response = responseJson(true, updatedSchedule, 'Re-Schedule requested successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id/re-schedule/accept", async (req, res) => {
    const { id } = req.params;

    const schedule = await Schedule.findOne({ _id: id });

    if (!schedule) {
        throw new Error('You are trying to update non-existing document.');
    }
    const updatedSchedule = await Schedule.findByIdAndUpdate(id, {
        $set: {
            start_time: schedule.reschedule_at,
            is_reschedule: false,
            reschedule_at: null,
            reschedule_by: null
        }
    }, { new: true });

    const response = responseJson(true, updatedSchedule, 'Re-Schedule updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

module.exports = router;