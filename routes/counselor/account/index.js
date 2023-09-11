const express = require("express");
const { StatusCodes } = require("http-status-codes");

const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const Counselor = require("../../../models/Counselor");

const router = express.Router();

router.get('/', async (req, res) => {

    const data = await Counselor.findOne({ user_id: req.user.id }).populate('user_id').lean();

    if (!data) {
        const response = responseJson(false, data, 'Your profile is not completed.', StatusCodes.OK, []);
        return res.status(StatusCodes.OK).json(response);
    }

    const response = responseJson(true, data, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post('/complete', async (req, res) => {

    const counselorRef = await Counselor.findOne({ user_id: req.user.id });
    const body = req.body;
    body.user_id = req.user.id

    if (!counselorRef) {
        await Counselor.create(body);
        const response = responseJson(true, {}, 'Profile Completed', StatusCodes.CREATED, []);
        return res.status(StatusCodes.CREATED).json(response);
    }

    await counselorRef.updateOne(body);
    const response = responseJson(true, {}, 'Profile Completed', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});




module.exports = router;  