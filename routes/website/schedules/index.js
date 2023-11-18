const express = require("express");

const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const CounselorMember = require("../../../models/CounselorMember");
const StudentInCounselor = require("../../../models/StudentInCounselor");

const Schedule = require("../../../models/Schedule");
const { makeMoved } = require("../../../utils/fileUpload");
const { genZoomToken } = require("../../../middleware/zoomAuthToken");
const Payment = require("../../../models/Payment");


const createScheduleValidationChain = [
    body('counselor').notEmpty().withMessage('Counselor id is required.'),
    body('reference_no').notEmpty().trim().withMessage('Payment is pending for booking session.'),
    body('service').notEmpty().trim().toLowerCase().withMessage('Topic is required.'),
    body('description').trim().toLowerCase(),
    body('duration').notEmpty().isNumeric({ min: 10, max: 100 }).withMessage('Duration is required'),
    body('start_time').notEmpty().withMessage('Date & time is required.'),
];


router.get("/", async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
    }

    const schedules = await Schedule.paginate({ student: req.user._id }, options);
    const response = responseJson(true, schedules, '', 200);
    return res.status(200).json(response);
});


router.get("/past", async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
    }

    const query = { student: req.user._id };
    query.start_time = { $lt: new Date() }

    const schedules = await Schedule.paginate(query, options);
    const response = responseJson(true, schedules, '', 200);
    return res.status(200).json(response);
});


router.get("/upcoming", async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
    }

    const query = { student: req.user._id };
    query.start_time = { $gte: new Date() }

    const schedules = await Schedule.paginate(query, options);
    const response = responseJson(true, schedules, '', 200);
    return res.status(200).json(response);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const schedule = await Schedule.findOne({ _id: id, student: req.user._id });

    if (!schedule) {
        throw new Error("No schedule found with id passed.");
    }
    const response = responseJson(true, schedule, '', 200);
    return res.status(200).json(response);
});

router.post("/checkout", createScheduleValidationChain, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const id = req.user._id;

    const { amount, service, reference_no } = req.body;


    const paymentRefValidate = await Payment.findOne({ reference_no });

    if (paymentRefValidate) {
        throw new Error('Payment Referrence id can\'t be same.');
    }

    const createPayment = {
        amount,
        service : 'consultation',
        reference_no,
        user: req.user._id,
        type: 'debit',
        note: 'Service purchased by student'
    }
    const paymentComplete = await Payment.create(createPayment);

    if (!paymentComplete) {
        throw new Error('Failed to book session transaction issue.')
    }

    const { counselor, start_time, duration, description } = req.body;
    const createSchedule = {
        payment_ref: paymentComplete._id,
        counselor,
        topic: service,
        start_time,
        duration,
        description,
        type: 'quote'
    }
    const scheduleCreate = await Schedule.create({ student: id, ...createSchedule });

    // add to student list for counselor 
    if(scheduleCreate){
            const isInStudentList = await StudentInCounselor.findOne({student: req.user._id, counselor});

            if(!isInStudentList){
                await StudentInCounselor.create({student: req.user._id, counselor});
            }
    }

    const response = responseJson(true, scheduleCreate, 'Session booked successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
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





module.exports = router;