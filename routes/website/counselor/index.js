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


router.get('/browse-counselors', async (req, res) => {

    const {
        limit, page, search, type, origin_country, services, rating, price_per_hour_min, price_per_hour_max
    } = req.query;

    const query = {};

    // if (type) {
    //     query.organization_type = type.toLowerCase();
    // }
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
            { agency_name: { $regex: new RegExp(search, 'i') } },
            { origin_country: { $regex: new RegExp(search, 'i') } },
            { city: { $regex: new RegExp(search, 'i') } },
            { services_provided: { $elemMatch: { $regex: new RegExp(search, 'i') } } },
        );
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
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

router.get("/services-provided", async (req, res) => {

    const {
        limit, page, search
    } = req.query;

    const query = {};

    const options = {
        limit, page,
        sort: { _id: -1 },
        select: { services_provided: 1 }
    }


    if (search) {
        query.services_provided = { $in: search.split(',') }
    }

    const aggregatePipeline = [
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $match: query
        },
        {
            $addFields: {
                name: {
                    $concat: ['$user.first_name', ' ', '$user.last_name']
                }
            }
        },
        {
            $group: {
                _id: null,
                services_provided: { $push: '$services_provided' }
            }
        },
        {
            $project: {
                _id: 0,
                services_provided: { $setUnion: { $reduce: { input: '$services_provided', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } } } }
            }
        },
    ];

    let servicesOffered = Counselor.aggregate(aggregatePipeline, options)

    servicesOffered = await Counselor.aggregatePaginate(servicesOffered, options)

    const regex = new RegExp(search, 'i');
    const services = servicesOffered?.docs[0]?.services_provided?.filter((el) => regex.test(el)) || [];

    const response = responseJson(true, { ...servicesOffered, docs: services }, '', 200);
    return res.status(200).json(response);
});

router.get("/service-detail/:id", async (req, res) => {
    const response = responseJson(false, {}, 'Module is Under progress.', 404);
    return res.status(200).json(response);
});

router.get("/show/:id", async (req, res) => {
    const { id } = req.params;
    let counselorProfile = await Counselor.findOne({ user_id: new ObjectId(id) }).populate([{ path: 'user_id', select: "first_name last_name email phone" }]).select({ bank_account_details: 0 });

    const counselorTeam = await CounselorMember.find({ counselor: new ObjectId(id) }).sort({ _id: -1 }).lean();

    const response = responseJson(true, { counselorProfile, counselorTeam }, '', 200);
    return res.status(200).json(response);
})


module.exports = router;