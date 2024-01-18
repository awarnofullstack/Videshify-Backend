const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");
const validate = require("../../../utils/validateHandler");

const CounselorMember = require("../../../models/CounselorMember");
const ActivePlanBilling = require("../../../models/ActivePlanBilling");
const PlanBilling = require("../../../models/PlanBilling");
const { makeMoved } = require("../../../utils/fileUpload");


const createCounselorMemberValidationChain = [
    body('name').notEmpty().trim().toLowerCase().withMessage('name is required field.'),
    body('email').isEmail().toLowerCase().withMessage('please provide valid email address').notEmpty().trim().withMessage('email is required field.'),
    body('experience').notEmpty().trim().withMessage('experience is required field.'),
    body('services').notEmpty().withMessage('services is required field.'),
];

const ObjectId = mongoose.Types.ObjectId;


router.get("/", async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
    }

    const members = await CounselorMember.paginate({ counselor: req.user._id }, options);
    const response = responseJson(true, members, '', 200);
    return res.status(200).json(response);
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const member = await CounselorMember.findOne({ _id: id });
    const response = responseJson(true, member, '', 200);
    return res.status(200).json(response);
});

router.post("/", [createCounselorMemberValidationChain, validate], async (req, res) => {

    const id = req.user._id;

    const activePlanBilling = await ActivePlanBilling.findOne({ counselor: new ObjectId(req.user._id), isExpired: false }).lean();

    if (!activePlanBilling) {
        throw new Error('Team members cannot be added until a plan is purchased for your account.')
    }

    const activePlan = await PlanBilling.findOne({ _id: activePlanBilling.plan }).lean();
    const totalMembersIn = await CounselorMember.find({ counselor: new ObjectId(req.user._id) }).countDocuments()


    if (totalMembersIn >= activePlan.uptomembers) {
        throw new Error('Team member limit reached. Upgrade your plan for additional capacity.')
    }


    if (req.files?.profile) {
        req.body.profile = makeMoved(req.files.profile);
    }

    const counselorMember = await CounselorMember.create({ counselor: id, ...req.body });
    const response = responseJson(true, counselorMember, 'A new member added.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;

    const counselorMember = await CounselorMember.findOne({ _id: id });

    if (!counselorMember) {
        throw new Error('You are trying to update non-existing document.');
    }

    if (req.files?.profile) {
        req.body.profile = makeMoved(req.files.profile);
    }

    const updatedMember = await CounselorMember.findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true });

    const response = responseJson(true, updatedMember, 'Member profile updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const counselorMember = await CounselorMember.findOne({ _id: id });

    if (!counselorMember) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await counselorMember.deleteOne();
    const response = responseJson(true, counselorMember, 'Member deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});





module.exports = router;