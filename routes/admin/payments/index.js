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


router.get("/", async (req, res) => {

    const { limit, page, search } = req.query;

    const options = {
        limit: parseInt(limit || 10),
        page: parseInt(page || 1),
        sort: { _id: -1 },
        populate: [{path:'user',select:'first_name last_name _id role email'}]
    }

    const query = { }

    const result = await Payment.paginate(query, options)

    const response = responseJson(true, result, '', 200);


    return res.status(200).json(response);
});


router.get("/tile", async (req, res) => {

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

    const response = responseJson(true, { totalReceived: totalReceived[0]?.sum || 0, lastReceived: lastReceived?.amount || 0}, '', 200);


    return res.status(200).json(response);
});

router.get("/graph", async (req, res) => {
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

module.exports = router;