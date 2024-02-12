const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Inquiry = require("../../../models/Inquiry");

router.get('/unread-responses', async (req, res) => {
    const inquiries = await Inquiry.find({ student: new mongoose.Types.ObjectId(req.user._id) });
    let unreadResponds = 0;

    inquiries.forEach((respond) => {
        unreadResponds += respond.unreadRespondsStudentCount
    })
    const response = responseJson(true, unreadResponds, '', 200);
    return res.json(response)
});

module.exports = router;