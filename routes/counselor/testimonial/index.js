const express = require("express");
const mongoose = require("mongoose")
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const CounselorMember = require("../../../models/CounselorMember");
const CounselorTestimonial = require("../../../models/CounselorTestimonial");
const { makeMoved } = require("../../../utils/fileUpload");
const validate = require("../../../utils/validateHandler");


const createCounselorTestimonialValidationChain = [
    body('name').notEmpty().trim().toLowerCase().withMessage('name is required field.'),
    body('university').notEmpty().trim().toLowerCase().withMessage('university is required field.'),
    body('youtube_link').notEmpty().trim().withMessage('youtube link is required field.')
];

const ObjectId = mongoose.Types.ObjectId;

router.get("/", async (req, res) => {

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
    }

    const testimonials = await CounselorTestimonial.paginate({ counselor: new ObjectId(req.user._id) }, options);
    const response = responseJson(true, testimonials, '', 200);
    return res.status(200).json(response);
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const testimonial = await CounselorTestimonial.findOne({ _id: id });
    const response = responseJson(true, testimonial, '', 200);
    return res.status(200).json(response);
});

router.post("/", [createCounselorTestimonialValidationChain, validate], async (req, res) => {

    const id = req.user._id;

    const counselorTestimonial = await CounselorTestimonial.create({ counselor: id, ...req.body });
    const response = responseJson(true, counselorTestimonial, 'A new testimonial added.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;

    const counselorTestimonial = await CounselorTestimonial.findOne({ _id: id });

    if (!counselorTestimonial) {
        throw new Error('You are trying to update non-existing document.');
    }

    const updatedTestimonial = await CounselorTestimonial.findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true });

    const response = responseJson(true, updatedTestimonial, 'Testimonial updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const counselorTestimonial = await CounselorTestimonial.findOne({ _id: id });

    if (!counselorTestimonial) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await counselorTestimonial.deleteOne();
    const response = responseJson(true, counselorTestimonial, 'Testimonial deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});





module.exports = router;