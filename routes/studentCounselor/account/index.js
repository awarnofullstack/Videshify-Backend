const express = require("express");
const { StatusCodes } = require("http-status-codes");

const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const Counselor = require("../../../models/Counselor");
const StudentCounselor = require("../../../models/StudentCounselor");

const router = express.Router();

router.get('/', async (req, res) => {

    const UserUnselectFieds = { createdAt: 0, updatedAt: 0, resetTokenExpiry: 0, resetToken: 0, __v: 0, approved: 0 }

    const data = await StudentCounselor.findOne({ user_id: req.user.id })
        .populate({ path: 'user_id', select: UserUnselectFieds })
        .select({ createdAt: 0, updatedAt: 0, __v: 0 }).lean();

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




module.exports = router;  