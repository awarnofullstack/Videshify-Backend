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
        limit, page, search } = req.query;

    const query = {};

    const options = {
        limit,
        page,
        select: { bank_account_details: 0 },
        populate: [{ path: 'user_id', select: ['first_name', 'last_name'] }]
    }

    const studentcounselors = await StudentCounselor.paginate(query, options);
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
        limit, page, search, type, origin_country, q_services, rating, price_per_hour_min, price_per_hour_max
    } = req.query;

    const query = {};

    if (type) {
        query.organization_type = type.toLowerCase();
    }
    if (origin_country) {
        query.origin_country = origin_country;
    }
    if (q_services) {
        query.services_provided = { $in: q_services };
    }
    // if (rating) {
    //     query.experience = { $gte: rating };
    // }
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

router.get("/:id/service/show", async (req, res) => {

    const { id } = req.params;
    const serviceDetail = await Service.findOne({ _id: id }).lean();

    if (!serviceDetail) {
        throw new Error('Invalid service id requested.');
    }

    const serviceByCounselor = await StudentCounselor.findOne({ user_id: serviceDetail.counselor }).select({ bank_account_details: 0 }).lean();

    const response = responseJson(false, { ...serviceDetail, ...serviceByCounselor }, '', 200);
    return res.status(200).json(response);
});


module.exports = router;