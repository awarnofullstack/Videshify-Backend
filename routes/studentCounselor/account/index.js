const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");

const responseJson = require("../../../utils/responseJson");
const {makeMoved} = require("../../../utils/fileUpload");


const User = require("../../../models/User");
const Counselor = require("../../../models/Counselor");
const StudentCounselor = require("../../../models/StudentCounselor");


const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

router.get('/', async (req, res) => {

    const UserUnselectFieds = { createdAt: 0, updatedAt: 0, resetTokenExpiry: 0, resetToken: 0, __v: 0, approved: 0 }

    const data = await StudentCounselor.findOne({ user_id: req.user.id })
        .populate({ path: 'user_id', select: UserUnselectFieds })
        .select({ createdAt: 0, updatedAt: 0, __v: 0 });

    if (!data) {
        const response = responseJson(false, data, 'Your profile is not completed.', StatusCodes.OK, []);
        return res.status(StatusCodes.OK).json(response);
    }

    const response = responseJson(true, data, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post('/complete', async (req, res) => {

    const counselorRef = await StudentCounselor.findOne({ user_id: req.user.id });
    const body = req.body;
    body.user_id = req.user.id


    const eligibility = {
        isApproved: req.user.approved,
        isCompleted: counselorRef ? true : false,
    }

    if (!counselorRef) {
        const createdProfile = await StudentCounselor.create(body);
        const response = responseJson(true, { profile: createdProfile, eligibility }, 'Profile Completed', StatusCodes.CREATED, []);
        return res.status(StatusCodes.CREATED).json(response);
    } 

    await counselorRef.updateOne(body);
    const response = responseJson(true, { profile: counselorRef, eligibility }, 'Profile Updated', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


router.post('/profile', async (req, res) => {

    const counselorRef = await StudentCounselor.findOne({ user_id: new ObjectId(req.user._id) }).lean();

    if (!counselorRef) {
        throw new Error('Invalid counselor request')
    }

    if (req.files?.profile) {
        req.body.profile = makeMoved(req.files.profile);
    }

    const counselor = await StudentCounselor.findByIdAndUpdate(counselorRef._id, { $set: { profile: req.body.profile } }, { new: true });
    const response = responseJson(true, counselor, 'Profile Updated', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});




module.exports = router;  