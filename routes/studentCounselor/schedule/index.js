const express = require("express");

const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const CounselorMember = require("../../../models/CounselorMember");
const Schedule = require("../../../models/Schedule");

const { makeMoved } = require("../../../utils/fileUpload");
const { createMeeting } = require("../../../utils/createMeeting");
const { genZoomToken } = require("../../../middleware/zoomAuthToken");

const createScheduleValidationChain = [
    body('name').notEmpty().trim().toLowerCase().withMessage('name is required field.'),
    body('email').isEmail().toLowerCase().withMessage('please provide valid email address').notEmpty().trim().withMessage('email is required field.'),
    body('experience').notEmpty().trim().withMessage('experience is required field.'),
    body('services').notEmpty().withMessage('services is required field.'),
];

const assignMemberValidationChain = [
    body('member_id').notEmpty().trim().withMessage('Member id is required field.'),
];


router.get("/", async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }]
    }

    const members = await Schedule.paginate({ counselor: req.user._id }, options);
    const response = responseJson(true, members, '', 200);
    return res.status(200).json(response);
});

router.get("/past", async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }]
    }

    const query = { counselor: req.user._id };
    query.start_time = { $lt: new Date() }

    const members = await Schedule.paginate(query, options);
    const response = responseJson(true, members, '', 200);
    return res.status(200).json(response);
});

router.get("/upcoming", async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }]
    }

    console.log(req.user);
    const query = { counselor: req.user._id };
    query.start_time = { $gte: new Date() }

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





module.exports = router;