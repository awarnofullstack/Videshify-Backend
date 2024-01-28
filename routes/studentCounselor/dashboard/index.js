const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Schedule = require("../../../models/Schedule");
const StudentCounselor = require("../../../models/StudentCounselor");
const WalletTransaction = require("../../../models/WalletTransaction");
const StudentInCounselor = require("../../../models/StudentInCounselor");
const Service = require("../../../models/Service");

const ObjectId = mongoose.Types.ObjectId;


router.get("/payments", async (req, res) => {

    const counselor = await StudentCounselor.findOne({ user_id: new ObjectId(req.user._id) }).lean();

    const lastReceived = await WalletTransaction.findOne({ user: new ObjectId(req.user._id), type: 'credit' }).lean();

    const totalReceived = await WalletTransaction.aggregate([
        {
            $match: { $and: [{ user: new ObjectId(req.user._id) }, { type: 'credit' }] }
        },
        {
            $group: {
                _id: "$user",
                sum: { $sum: '$amount' }
            }
        },
        {
            $project: { _id: 0, sum: 1 }
        }
    ]);
    const balance = counselor?.walletBalance;

    const response = responseJson(true, { totalReceived: totalReceived[0]?.sum || 0, lastReceived: lastReceived?.amount || 0, remainBalance: balance || 0 }, '', 200);
    return res.status(200).json(response);
});


router.get("/graph", async (req, res) => {

    const startDate = moment().subtract(8, 'months').startOf('month');
    const endDate = moment().endOf('month');

    const result = await WalletTransaction.aggregate([
        {
            $match: {
                user: new ObjectId(req.user._id),
                type: 'credit',
                createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                totalAmount: { $sum: '$amount' },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    const formattedData = [];
    const categories = [];
    let currentDate = moment(startDate);

    for (let i = 0; i < 9; i++) {
        const monthKey = currentDate.format('YYYY-MM');
        const monthName = currentDate.format('MMM');
        const matchingResult = result.find((item) => item._id === monthKey);

        categories.push(monthName);
        formattedData.push({
            month: monthKey,
            totalAmount: matchingResult ? matchingResult.totalAmount : 0,
        });

        currentDate.add(1, 'month');
    }

    const response = responseJson(true, { categories, date: formattedData }, '', 200);
    return res.status(200).json(response);
});

router.get("/counselor-student", async (req, res) => {

    const totalStudents = await StudentInCounselor.find({ counselor: new ObjectId(req.user._id) }).countDocuments();
    const totalServices = await Service.find({ counselor: new ObjectId(req.user._id) }).countDocuments();

    const response = responseJson(true, { totalStudents, totalServices }, '', 200);
    return res.status(200).json(response);
});


router.get("/bookings", async (req, res) => {

    const totalUpcomings = await Schedule.find({ start_time: { $gte: new Date() }, counselor: new ObjectId(req.user._id) }).countDocuments();
    const totalReschedules = await Schedule.find({ is_reschedule: true, counselor: new ObjectId(req.user._id) }).countDocuments();
    const totalPast = await Schedule.find({ start_time: { $lt: new Date() }, counselor: new ObjectId(req.user._id) }).countDocuments();

    const response = responseJson(true, { totalUpcomings, totalPast, totalReschedules }, '', 200);
    return res.status(200).json(response);
});



module.exports = router;