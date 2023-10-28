const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Inquiry = require("../../../models/Inquiry");
const { makeMoved } = require("../../../utils/fileUpload");


const ObjectId = mongoose.Types.ObjectId;
const createInquiryQuoteValidationChain = [
    body('message').notEmpty().trim().toLowerCase().withMessage('message is required field.'),
    body('isQuote').notEmpty().withMessage('isQuote is required field'),
    body('counselor').trim(),
    body('services').notEmpty().withMessage('services is required field.'),
];


router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
    }

    const inquiries = await Inquiry.paginate({ student: req.user._id }, options);
    const response = responseJson(true, inquiries, '', 200);
    return res.status(200).json(response);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const inquiry = await Inquiry.findOne({ _id: new ObjectId(id) });

    if(!inquiry){
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

    const id = req.user._id;

    if (req.files.profile) {
        req.body.profile = makeMoved(req.files.profile);
    }

    const counselorMember = await CounselorMember.create({ counselor: id, ...req.body });
    const response = responseJson(true, counselorMember, 'A new member added.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

// router.put("/:id", async (req, res) => {
//     const { id } = req.params;

//     const counselorMember = await CounselorMember.findOne({ _id: id });

//     if (!counselorMember) {
//         throw new Error('You are trying to update non-existing document.');
//     }

//     if (req.files.profile) {
//         req.body.profile = makeMoved(req.files.profile);
//     }

//     const updatedMember = await CounselorMember.findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true });

//     const response = responseJson(true, updatedMember, 'Member profile updated successfuly.', StatusCodes.OK, []);
//     return res.status(StatusCodes.OK).json(response);
// });

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