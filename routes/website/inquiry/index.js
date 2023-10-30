const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Inquiry = require("../../../models/Inquiry");
const Counselor = require("../../../models/Counselor");
const { makeMoved } = require("../../../utils/fileUpload");


const ObjectId = mongoose.Types.ObjectId;
const createInquiryQuoteValidationChain = [
    body('message').notEmpty().trim().toLowerCase().withMessage('message is required field.'),
    body('counselor').notEmpty().trim().withMessage('counselor id is required field.')
];


router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 }
    }

    const inquiries = await Inquiry.paginate({ student: req.user._id }, options);
    const response = responseJson(true, inquiries, '', 200);
    return res.status(200).json(response);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const inquiry = await Inquiry.findOne({ _id: new ObjectId(id) }).lean();

    if (!inquiry) {
        throw new Error("Invalid document id, no record found.");
    }

    const response = responseJson(true, inquiry, '', 200);
    return res.status(200).json(response);
});

router.post("/", createInquiryQuoteValidationChain, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const { counselor, message } = req.body;

    const counselorDoc = await Counselor.findOne({ user_id: counselor });

    if (!counselorDoc) {
        throw new Error('Invalid Counselor ID try again.');
    }

    const id = req.user._id;

    const respond = { _id: new ObjectId(), message, sender: 'student' }

    const inquiryCreate = new Inquiry({ student: id, counselor });
    inquiryCreate.responds.push(respond);
    await inquiryCreate.save();

    const response = responseJson(true, inquiryCreate, 'Inquiry sent.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const inquiry = await Inquiry.findOne({ _id: new ObjectId(id) });

    if (!inquiry) {
        throw new Error("Invalid document id, no record found.");
    }


    const newRespond = { _id: new ObjectId(), message: req.body.message, sender: 'student' }

    const inquiryUpdate = await Inquiry.findByIdAndUpdate(new ObjectId(id), { $push: { responds: newRespond } }, { new: true });

    const response = responseJson(true, inquiryUpdate, 'Replied to inquiry.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

// router.delete("/:id", async (req, res) => {
//     const { id } = req.params;

//     const counselorMember = await CounselorMember.findOne({ _id: id });

//     if (!counselorMember) {
//         throw new Error('You are trying to delete non-existing document.');
//     }

//     await counselorMember.deleteOne();
//     const response = responseJson(true, counselorMember, 'Member deleted successfuly.', StatusCodes.OK, []);
//     return res.status(StatusCodes.OK).json(response);
// });





module.exports = router;