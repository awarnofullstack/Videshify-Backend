const express = require("express");
const path = require("path");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

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

router.get("/service/:id", async (req, res) => {
    return res.send("service detail");
})

router.get("/profile/:id", async (req, res) => {
    return res.send("service detail");
})





module.exports = router;