const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const User = require("../../../models/User");
const Schedule = require("../../../models/Schedule");
const Payment = require("../../../models/Payment");
const WalletTransaction = require("../../../models/WalletTransaction");
const moment = require("moment");
const ActivePlanBilling = require("../../../models/ActivePlanBilling");

const ObjectId = mongoose.Types.ObjectId;


router.get("/payments", async (req, res) => {

    const lastReceived = await Payment.findOne({ type: 'debit' }).sort({ _id: -1 }).lean();

    const totalReceived = await Payment.aggregate([
        {
            $match: { type: 'debit' }
        },
        {
            $group: {
                _id: "$type",
                sum: { $sum: '$amount' }
            }
        },
        {
            $project: { _id: 0, sum: 1 }
        }
    ]);

    const totalDisburse = await WalletTransaction.aggregate([
        {
            $match: { type: 'debit' }
        },
        {
            $group: {
                _id: "$type",
                sum: { $sum: '$amount' }
            }
        },
        {
            $project: { _id: 0, sum: 1 }
        }
    ]);

    const response = responseJson(true, { totalReceived: totalReceived[0]?.sum || 0, lastReceived: lastReceived?.amount || 0, disburseAmount: totalDisburse[0]?.sum || 0 }, '', 200);


    return res.status(200).json(response);
});

router.get("/payments/graph", async (req, res) => {
    const startDate = moment().subtract(8, 'months').startOf('month');
    const endDate = moment().endOf('month');

    const result = await Payment.aggregate([
        {
            $match: {
                type: 'debit',
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

        categories.push(monthName)

        formattedData.push({
            month: monthKey,
            totalAmount: matchingResult ? matchingResult.totalAmount : 0,
        });

        currentDate.add(1, 'month');
    }

    const response = responseJson(true, { data: formattedData, categories }, '', 200);


    return res.status(200).json(response);
});

router.get("/counselor-student", async (req, res) => {

    const totalStudents = await User.find({ role: 'student' }).countDocuments()
    const totalCounselors = await User.find({ role: { $in: ['counselor', 'student counselor'] } }).countDocuments();
    const response = responseJson(true, { totalStudents, totalCounselors }, '', 200);
    return res.status(200).json(response);
});


router.get("/revenue-bookings-plans", async (req, res) => {


    const startDate = moment().subtract(1, 'months').startOf('month');
    const endDate = moment().subtract(1, 'months').endOf('month');

    const result = await Payment.aggregate([
        {
            $match: {
                type: 'debit',
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
        {
            $project: { _id: 0, totalAmount: 1 }
        }
    ]);

    const totalUpcomings = await Schedule.find({ start_time: { $gte: new Date() }}).countDocuments();

    const plans = await ActivePlanBilling.find().countDocuments();

    const response = responseJson(true, { revenue: result[0]?.totalAmount || 0, bookings: totalUpcomings, plans }, '', 200);
    return res.status(200).json(response);
});



module.exports = router;