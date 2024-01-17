const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const User = require("../../../models/User");
const Schedule = require("../../../models/Schedule");

const ObjectId = mongoose.Types.ObjectId;


router.get("/counselor-student", async (req, res) => {

    const totalStudents = await User.find({ role: 'student' }).countDocuments();
    const totalCounselors = await User.find({ role: { $in: ['student counselor', 'counselor'] } }).countDocuments();
    const response = responseJson(true, { totalStudents, totalCounselors }, '', 200);
    return res.status(200).json(response);
});

router.get("/bookings", async (req, res) => {

    const totalUpcomings = await Schedule.find({ start_time: { $gte: new Date() } }).countDocuments();
    const totalReschedules = await Schedule.find({ is_reschedule: true }).countDocuments();
    const totalPast = await Schedule.find({ start_time: { $lt: new Date() } }).countDocuments();

    const response = responseJson(true, { totalUpcomings, totalPast, totalReschedules }, '', 200);
    return res.status(200).json(response);
});



module.exports = router;