const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");

const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const Counselor = require("../../../models/Counselor");
const Payment = require("../../../models/Payment");

const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;


router.get("/", async (req, res) => {

    const { limit, page, search } = req.query;

    const options = {
        limit: parseInt(limit || 10),
        page: parseInt(page || 1),
        sort: { _id: -1 }
    }

    const query = { user: new ObjectId(req.user._id) }


    if (search) {
        query.reference_no = { $regex: `${search}`, $options: 'i' }
    }

    const payments = await Payment.paginate(query, options);
    const response = responseJson(true, payments, '', 200);
    return res.status(200).json(response);
});

router.get("/tile", async (req, res) => {

    const payments = await Payment.aggregate([
        {
            $match: { $and: [{ user: new ObjectId(req.user._id) }, { type: 'debit' }] }
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

    const recentPayment = await Payment.findOne({ user: new ObjectId(req.user._id) }).sort({ _id: -1 }).lean()

    const response = responseJson(true, { totalAmount: payments[0]?.sum, recentPayment: recentPayment?.amount || 0 }, '', 200);
    return res.status(200).json(response);
});


module.exports = router;