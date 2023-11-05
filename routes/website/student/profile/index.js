const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");

const { makeMoved } = require("../../../../utils/fileUpload");

const responseJson = require("../../../../utils/responseJson");
const Student = require("../../../../models/Student");
const { sendMailAsync } = require("../../../../utils/emailTransport");

const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;

router.get("/show", async (req, res) => {

    const data = await Student.findOne({ user_id: req.user._id });
    if (!data) {
        throw new Error("Failed to find the profile.");
    }

    const response = responseJson(true, data, ``, StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);
});


router.post("/complete", async (req, res) => {

    const id = req.user._id;
    const isCompleted = await Student.findOne({ user_id: id }).lean();

    if (req.files?.profile) {
        req.body.profile = makeMoved(req.files.profile)
    }

    if (isCompleted) {
        const updatedProfile = await Student.findByIdAndUpdate(isCompleted._id, { $set: { ...req.body } }, { new: true });
        const response = responseJson(true, updatedProfile, 'Profile is updated.', StatusCodes.OK, [])
        return res.status(StatusCodes.OK).json(response);
    }

    await Student.create({ ...req.body, user_id: req.user._id });
    const response = responseJson(true, isCompleted, 'Profile is completed.', StatusCodes.OK, [])
    return res.status(StatusCodes.OK).json(response);

});




module.exports = router;  