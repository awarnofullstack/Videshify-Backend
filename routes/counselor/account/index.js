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


module.exports = router;  