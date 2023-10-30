const express = require("express");
const path = require("path");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");


const ObjectId = mongoose.Types.ObjectId;
const router = express.Router();

const responseJson = require("../../../utils/responseJson");

const Counselor = require("../../../models/Counselor")


router.get('/browse-services', async (req, res) => {
    return res.send("hello counselors")
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
        console.log(q_services);
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
        select: '-bank_account_details'
    }

    const findPopularCounselor = await Counselor.paginate(query, { ...options });
    const response = responseJson(true, findPopularCounselor, '', 200);
    return res.status(200).json(response);

});

router.get("/service-detail/:id", async (req, res) => {
    const response = responseJson(false, {}, 'Module is Under progress.', 404);
    return res.status(200).json(response);
});

router.get("/show/:id", async (req, res) => {
    const { id } = req.params;
    const counselorProfile = await Counselor.findOne({ user_id: new ObjectId(id) }).populate([{ path: 'user_id', select: "first_name last_name email phone" }]).select({ bank_account_details: 0 });

    const response = responseJson(true, counselorProfile, '', 200);
    return res.status(200).json(response);
})





module.exports = router;