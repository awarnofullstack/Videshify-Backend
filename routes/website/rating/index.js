const express = require("express");
const path = require("path");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");


const ObjectId = mongoose.Types.ObjectId;
const router = express.Router();

const responseJson = require("../../../utils/responseJson");

const Counselor = require("../../../models/Counselor");
const CounselorMember = require("../../../models/CounselorMember");
const Rating = require("../../../models/Rating");
const ServiceRating = require("../../../models/ServiceRating");
const Service = require("../../../models/Service");
const StudentCounselor = require("../../../models/StudentCounselor");


router.post("/:id/counselor", async (req, res) => {

    const { id } = req.params;
    const { rating, reviewText } = req.body;

    // Create a new review
    const review = new Rating({
        counselor: id,
        rating,
        rateBy: req.user._id,
        reviewText
    });

    // Save the review
    await review.save();

    // Update counselor's average rating and number of reviews
    const counselor = await Counselor.findOne({ user_id: id });

    if (!counselor) {
        throw new Error('Invalid counselor id requested.')
    }

    counselor.averageRating = counselor.averageRating || 0;
    counselor.numberOfReviews = counselor.numberOfReviews || 0;

    counselor.averageRating = ((counselor.averageRating * counselor.numberOfReviews) + rating) / (counselor.numberOfReviews + 1).toFixed(1);
    counselor.numberOfReviews += 1;

    // Save the updated counselor
    await counselor.save();

    const response = responseJson(true, counselor, 'Review submitted successfully', 200);
    return res.status(200).json(response);
});



router.post("/:id/student-counselor", async (req, res) => {

    const { id } = req.params;
    const { rating, reviewText } = req.body;

    // Create a new review
    const review = new Rating({
        counselor: id,
        rating,
        rateBy: req.user._id,
        reviewText
    });

    // Save the review
    await review.save();

    // Update counselor's average rating and number of reviews
    const studentCounselor = await StudentCounselor.findOne({ user_id: id });

    studentCounselor.averageRating = studentCounselor.averageRating || 0;
    studentCounselor.numberOfReviews = studentCounselor.numberOfReviews || 0;

    studentCounselor.averageRating = ((studentCounselor.averageRating * studentCounselor.numberOfReviews) + rating) / (studentCounselor.numberOfReviews + 1);
    studentCounselor.numberOfReviews += 1;

    // Save the updated counselor
    await studentCounselor.save();

    const response = responseJson(true, studentCounselor, 'Review submitted successfully', 200);
    return res.status(200).json(response);
});



router.post("/:id/service", async (req, res) => {

    const { id } = req.params;
    const { rating, reviewText } = req.body;

    // Create a new review
    const review = new ServiceRating({
        service: id,
        rating,
        rateBy: req.user._id,
        reviewText
    });

    // Save the review
    await review.save();

    // Update counselor's average rating and number of reviews
    const service = await Service.findOne({ _id: id });

    if (!service) {
        throw new Error('Invalid service id requested.')
    }

    service.averageRating = service.averageRating || 0;
    service.numberOfReviews = service.numberOfReviews || 0;

    service.averageRating = ((service.averageRating * service.numberOfReviews) + rating) / (service.numberOfReviews + 1);
    service.numberOfReviews += 1;

    // Save the updated counselor
    await service.save();

    const response = responseJson(true, service, 'Review submitted successfully', 200);
    return res.status(200).json(response);
});



router.get("/:id/counselor", async (req, res) => {

    const { id } = req.params;
    const { limit, page } = req.query;
    const options = {
        page,
        limit,
        populate: [{ path: 'rateBy' }]
    }

    // Create a new review
    const reviews = await Rating.paginate({ counselor: id }, options);

    const response = responseJson(true, reviews, '', 200);
    return res.status(200).json(response);
});

router.get("/:id/student-counselor", async (req, res) => {

    const { id } = req.params;
    const { limit, page } = req.query;
    const options = {
        page,
        limit,
        populate: [{ path: 'rateBy' }]
    }
    // Create a new review
    const reviews = await Rating.paginate({ counselor: id }, options);
    const response = responseJson(true, reviews, '', 200);
    return res.status(200).json(response);
});

router.get("/:id/service", async (req, res) => {

    const { id } = req.params;
    const { limit, page } = req.query;
    const options = {
        page,
        limit,
        populate: [{ path: 'rateBy' }]
    }

    // Create a new review
    const reviews = await ServiceRating.paginate({ service: id }, options);

    const response = responseJson(true, reviews, '', 200);
    return res.status(200).json(response);
});


module.exports = router;