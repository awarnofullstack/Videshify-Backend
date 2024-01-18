const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment")

const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Inquiry = require("../../../models/Inquiry");
const { makeMoved } = require("../../../utils/fileUpload");


const ObjectId = mongoose.Types.ObjectId;


router.get("/", async (req, res) => {
    const { limit, page, search, date } = req.query;

    const unSelectFields = {
        resetToken: 0,
        createdAt: 0,
        updatedAt: 0,
        password: 0,
        resetTokenExpiry: 0,
        __v: 0
    }

    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'student', select: unSelectFields }]
    }

    const query = { counselor: new ObjectId(req.user._id) };

    if (date && date !== 'null' && date !== '' && date !== 'Invalid date') {
        const momentDate = moment(date);
        const startOfDay = momentDate.add(1, 'day');

        query.createdAt = {
            $gte: date,
            $lte: startOfDay,
        };

    }

    const inquiries = await Inquiry.paginate(query, options);
    const response = responseJson(true, inquiries, '', 200);
    return res.status(200).json(response);
});



router.get("/tile", async (req, res) => {
    const recentWeek = moment().subtract(7, 'days')

    const totalInquiry = await Inquiry.find({ counselor: new ObjectId(req.user._id) }).countDocuments();
    const RecentAdded = await Inquiry.find({ createdAt: { $gte: recentWeek }, counselor: new ObjectId(req.user._id) }).countDocuments();
    const totalResolved = await Inquiry.find({ status: 'closed', counselor: new ObjectId(req.user._id) }).countDocuments();
    const response = responseJson(true, { totalInquiry, RecentAdded, totalResolved }, '', 200);
    return res.status(200).json(response);
});


router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const inquiry = await Inquiry.findOne({ _id: new ObjectId(id) }).populate({ path: 'student', select: ['first_name', 'last_name', 'email', 'phone'] });

    if (!inquiry) {
        throw new Error("Invalid document id, no record found.");
    }

    inquiry.responds.forEach(respond => {
        if (respond.sender === 'student') {
            respond.isRead = true;
        }
    });

    const inquiryUpdate = await Inquiry.findByIdAndUpdate(new ObjectId(id), { $set: { responds: inquiry.responds } }, { new: true }).populate({ path: 'student', select: ['first_name', 'last_name', 'email', 'phone'] });


    const response = responseJson(true, inquiryUpdate, '', 200);
    return res.status(200).json(response);
});


router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const inquiry = await Inquiry.findById(new ObjectId(id));

    if (!inquiry) {
        throw new Error("No inquiry exist with this inquiry id.");
    }

    let newRespond = { _id: new ObjectId(), message: req.body.message, sender: 'counselor' }

    if (req.body.isQuote) {
        newRespond = { ...newRespond, ...req.body.quote, isQuote: true }
    }

    inquiry.responds.push(newRespond);
    const inquiryUpdate = await inquiry.save();

    const response = responseJson(true, inquiryUpdate, 'Quote sent to inquiry.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const inquiry = await Inquiry.findOne({ _id: id, counselor: req.user._id });

    if (!inquiry) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await inquiry.deleteOne();
    const response = responseJson(true, {}, 'Inquiry deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



router.delete("/:id/remove/:respond_id", async (req, res) => {
    const { id, respond_id } = req.params;

    const inquiry = await Inquiry.findOne({ _id: new ObjectId(id), 'responds._id': new ObjectId(respond_id) });

    if (!inquiry) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await inquiry.updateOne({
        $pull: { task: { _id: respond_id } }
    });
    const response = responseJson(true, inquiry, 'Inquiry deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



module.exports = router;