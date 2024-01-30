const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")

const User = require("../../../models/User");
const StudentCounselor = require("../../../models/StudentCounselor");
const CounselorTestimonial = require("../../../models/CounselorTestimonial");
const StudentInCounselor = require("../../../models/StudentInCounselor");
const Student = require("../../../models/Student");
const responseJson = require("../../../utils/responseJson");
const Schedule = require("../../../models/Schedule");
const Payment = require("../../../models/Payment");
const WalletTransaction = require("../../../models/WalletTransaction");

const ObjectId = mongoose.Types.ObjectId;


router.get("/:id", async (req, res) => {

    const { id } = req.params;

    const transaction = await WalletTransaction.findById(new ObjectId(id));
    const schedule = await Schedule.findById(transaction.schedule);
    const paymentRef = await Payment.findById(schedule.payment_ref);

    const response = responseJson(true, {schedule, paymentRef},'', 200);
    return res.status(200).json(response);
});


module.exports = router;