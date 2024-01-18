const express = require("express");
const mongoose = require("mongoose");

const responseJson = require("../../../utils/responseJson");
const StudentCounselor = require("../../../models/StudentCounselor");
const WalletTransaction = require("../../../models/WalletTransaction");

const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;


router.get("/transaction", async (req, res) => {

    const { limit, page, search } = req.query;

    const options = {
        limit: parseInt(limit || 10),
        page: parseInt(page || 1),
        sort: { _id: -1 },
        populate: [{ path: 'schedule' }]
    }

    const query = { user: new ObjectId(req.user._id) }

    if (search) {
        query.reference = { $regex: `${search}`, $options: 'i' }
    }

    const wallets = await WalletTransaction.paginate(query, options);
    const response = responseJson(true, wallets, '', 200);
    return res.status(200).json(response);
});

router.get("/tile", async (req, res) => {

    const payments = await StudentCounselor.findOne({ user_id: new ObjectId(req.user._id) }).lean()

    const recentPayment = await WalletTransaction.findOne({ user: new ObjectId(req.user._id) }).sort({ _id: -1 }).lean();

    // const recentPayment = await WalletTransaction.findOne({ user: new ObjectId(req.user._id) }).sort({ _id: -1 }).lean()
    const withdrawn = await WalletTransaction.aggregate([
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


    const response = responseJson(true, { totalAmount: payments?.walletBalance || 0, recentPayment: recentPayment?.amount || 0, totalWithdraw: withdrawn[0]?.sum || 0 }, '', 200);
    return res.status(200).json(response);
});

router.post('/withdraw', async (req, res) => {
    const counselorId = req.user._id;

    const withdrawalAmount = parseFloat(req.body.amount);


    // Retrieve counselor and check balance
    const counselor = await StudentCounselor.findOne({ user_id: new ObjectId(counselorId) }).lean();

    if (!counselor) {
        const response = responseJson(false, null, 'Invalid counselor id requested', 400);
        return res.status(200).json(response)
    }

    if (counselor.walletBalance < withdrawalAmount) {
        const response = responseJson(false, null, 'Insufficient balance', 400);
        return res.status(200).json(response)
    }

    // Deduct withdrawal amount and update wallet balance
    await StudentCounselor.findByIdAndUpdate(counselor._id, { $inc: { walletBalance: -withdrawalAmount } });

    // Create withdrawal transaction
    const record = await WalletTransaction.create({
        user: counselorId,
        type: 'debit',
        amount: withdrawalAmount,
        reference: 'Withdrawal from wallet',
    });

    const response = responseJson(true, record, 'Withdraw request raised.', 200);
    return res.status(200).json(response);
});


module.exports = router;