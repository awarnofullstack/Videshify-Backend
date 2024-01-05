const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");
const validate = require("../../../utils/validateHandler")


const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Contact = require("../../../models/Contact");

const ObjectId = mongoose.Types.ObjectId;

const createContactValidationChain = [
    body('name').notEmpty().trim().toLowerCase().withMessage('name is required.'),
    body('email').notEmpty().trim().withMessage('email is required.'),
    body('phone').notEmpty().trim().withMessage('phone is required.'),
    body('message').notEmpty().trim().withMessage('message is required.'),
];

router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 }
    }

    const contacts = await Contact.paginate({}, options);
    const response = responseJson(true, contacts, '', 200);
    return res.status(200).json(response);
});

router.post("/store", [createContactValidationChain, validate], async (req, res) => {

    const contact = await Contact.create({ ...req.body });

    if (!contact) {
        throw new Error("Failed to submit.");
    }

    const response = responseJson(true, contact, 'Thank you for submitting.', 200);
    return res.status(200).json(response);
});

module.exports = router;