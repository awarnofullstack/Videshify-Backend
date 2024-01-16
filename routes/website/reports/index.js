const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");
const validate = require("../../../utils/validateHandler");

const Report = require("../../../models/Report");
const User = require("../../../models/User");

const ObjectId = mongoose.Types.ObjectId;
const createReportValidationChain = [
    body('flag').notEmpty().trim().toLowerCase().withMessage('Report/flag is required field.'),
];

router.post("/:id", [createReportValidationChain, validate], async (req, res) => {

    const { id } = req.params;
    const { flag } = req.body;

    const counselorDoc = await User.findById(id);

    if (!counselorDoc) {
        throw new Error('Invalid Counselor ID try again.');
    }


    const reportDoc = await Report.findOne({ counselor: id, reportBy: req.user._id });

    if (reportDoc) {
        throw new Error('Already reported this profile.');
    }

    const report = { counselor: id, flag, reportBy: req.user._id }

    const reportCreate = await Report.create(report);

    const response = responseJson(true, reportCreate, 'Profile Reported.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;