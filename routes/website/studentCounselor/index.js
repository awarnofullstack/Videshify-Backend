const express = require("express");
const path = require("path");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");


const ObjectId = mongoose.Types.ObjectId;
const router = express.Router();

const responseJson = require("../../../utils/responseJson");

const StudentCounselor = require("../../../models/StudentCounselor");
const Service = require("../../../models/Service");

router.get('/mentors', async (req, res) => {

    const {
        limit, page, search, type, origin_country, services, rating, price_per_hour_min, price_per_hour_max
    } = req.query;

    const query = {};


    if (origin_country) {
        query.origin_country = { $regex: `${origin_country}`, $options: 'i' };
    }
    if (services) {
        query.services_provided = { $in: services.split(",") };
    }

    if (rating) {
        query.averageRating = { $gte: rating };
    }

    const orConditions = [];

    if (search) {
        orConditions.push(
            { 'user.first_name': { $regex: new RegExp(search, 'i') } },
            { 'user.last_name': { $regex: new RegExp(search, 'i') } },
        );
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
    }

    const options = {
        limit,
        page,
        select: { bank_account_details: 0 },
        populate: [{ path: "user_id", select: "first_name last_name" }]
    }

    const counselors = StudentCounselor.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user',
                pipeline: [
                    {
                        $addFields: { name: { $concat: ['$first_name', ' ', '$last_name'] } }
                    },
                    {
                        $project: { first_name: 1, last_name: 1, _id: 1, role: 1, name: 1 }
                    }
                ]
            },
        },
        {
            $unwind: '$user'
        },
        {
            $project: { bank_account_details: 0 }
        },
        {
            $match: query
        }
    ]);

    const studentcounselors = await StudentCounselor.aggregatePaginate(counselors, options);
    const response = responseJson(true, studentcounselors, '', 200);
    return res.status(200).json(response);
});



router.get("/:id/show", async (req, res) => {
    const { id } = req.params;
    let counselorProfile = await StudentCounselor.findOne({ user_id: new ObjectId(id) }).populate([{ path: 'user_id', select: "first_name last_name email phone" }]).select({ bank_account_details: 0 });

    const counselorServices = await Service.paginate({ counselor: new ObjectId(id) }, { limit: 10, page: 1, sort: { _id: -1 } });

    const response = responseJson(true, { counselorProfile, counselorServices }, '', 200);
    return res.status(200).json(response);
})

router.get("/:id/services", async (req, res) => {
    const { id } = req.params;
    const counselorServices = await Service.paginate({ counselor: new ObjectId(id) }, { limit: 10, page: 1, sort: { _id: -1 } });

    const response = responseJson(true, counselorServices, '', 200);
    return res.status(200).json(response);
});

router.get('/browse-counselors', async (req, res) => {

    const {
        limit, page, search, type, origin_country, services, rating, price_per_hour_min, price_per_hour_max
    } = req.query;

    const query = {};

    if (origin_country) {
        query.origin_country = { $regex: `${origin_country}`, $options: 'i' };
    }
    if (services) {
        query.services_provided = { $in: services.split(",") };
    }

    if (rating) {
        query.averageRating = { $gte: rating };
    }

    if (search) {
        query.agency_name = { $regex: `${search}`, $options: 'i' };
    }

    // if (pricePerHour) {
    //     query['bank_account_details.price_per_hour'] = { $lte: parseFloat(pricePerHour) };
    // }

    const options = {
        limit,
        page,
        select: { bank_account_details: 0 }
    }

    const findPopularCounselor = await Counselor.paginate(query, { ...options });
    const response = responseJson(true, findPopularCounselor, '', 200);
    return res.status(200).json(response);

});


router.get('/browse-services', async (req, res) => {

    const {
        limit, page, search, type, origin_country, services, rating, price_per_hour_min, price_per_hour_max
    } = req.query;

    const query = {};

    if (rating) {
        query.averageRating = { $gte: rating };
    }

    if (search) {
        query.service_name = { $regex: `${search}`, $options: 'i' };
    }

    const options = {
        limit,
        page,
        populate: [{ path: 'counselor', select: ['first_name', 'last_name'] }]
    }
    const servicesList = await Service.paginate(query, options);
    const response = responseJson(true, servicesList, '', 200);
    return res.status(200).json(response);

});

router.get("/:id/service/show", async (req, res) => {

    const { id } = req.params;
    const serviceDetail = await Service.findOne({ _id: id }).lean();

    if (!serviceDetail) {
        throw new Error('Invalid service id requested.');
    }

    const counselor = await StudentCounselor.findOne({ user_id: serviceDetail.counselor }).select({ bank_account_details: 0 }).populate('user_id');

    const response = responseJson(true, { ...serviceDetail, counselor }, '', 200);
    return res.status(200).json(response);
});


module.exports = router;