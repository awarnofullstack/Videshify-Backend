const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Inquiry = require("../../../models/Inquiry");
const { makeMoved } = require("../../../utils/fileUpload");


const ObjectId = mongoose.Types.ObjectId;


router.get("/", async (req, res) => {
    const { limit, page } = req.query;

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
        select: { responds: 0 },
        sort: { _id: -1 },
        populate: [{ path: 'student', select: unSelectFields }]
    }

    const inquiries = await Inquiry.paginate({ counselor: req.user._id }, options);
    const response = responseJson(true, inquiries, '', 200);
    return res.status(200).json(response);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const inquiry = await Inquiry.findOne({ _id: new ObjectId(id) }).populate({ path: 'student', select: ['first_name', 'last_name', 'email', 'phone'] });

    if (!inquiry) {
        throw new Error("Invalid document id, no record found.");
    }

    const response = responseJson(true, inquiry, '', 200);
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