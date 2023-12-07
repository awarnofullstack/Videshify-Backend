const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body } = require("express-validator")

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Service = require("../../../models/Service");
const validate = require("../../../utils/validateHandler");
const { makeMoved } = require("../../../utils/fileUpload");

const ObjectId = mongoose.Types.ObjectId;



const createServiceValidationChain = [
    body('service_name').notEmpty().trim().toLowerCase().withMessage('service name is required field.'),
    body('price').isNumeric().withMessage('price should be a number type.').notEmpty().trim().withMessage('price is required field.'),
    body('duration').notEmpty().trim().withMessage('session duration is required field.'),
    body('description').notEmpty().withMessage('services is required field.'),
    body('contents').notEmpty().withMessage('contents is required field.'),
];

router.get("/", async (req, res) => {
    const { limit, page } = req.query;

    const options = {
        limit,
        page,
        sort: { _id: -1 },
    }

    const services = await Service.paginate({ counselor: req.user._id }, options);
    const response = responseJson(true, services, '', 200);
    return res.status(200).json(response);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const service = await Service.findOne({ _id: new ObjectId(id) });

    if (!service) {
        throw new Error("Invalid document id, no record found.");
    }

    const response = responseJson(true, service, '', 200);
    return res.status(200).json(response);
});


router.post("/", [createServiceValidationChain, validate], async (req, res) => {
    const { service_name } = req.body;
    const service = await Service.findOne({ service_name });

    if (service) {
        throw new Error("Service name already used try different name.");
    }

    if (req.files?.cover_photo) {
        req.body.cover_photo = makeMoved(req.files.cover_photo);
    }

    const serviceUpdate = await Service.create({...req.body, counselor: req.user._id});

    const response = responseJson(true, serviceUpdate, 'Service created.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const service = await Service.findById(new ObjectId(id));

    if (!service) {
        throw new Error("No service exist with this service id.");
    }

    const inquiryUpdate = await Service.findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true });

    const response = responseJson(true, inquiryUpdate, 'Service updated.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.patch("/:id/inactive", async (req, res) => {
    const { id } = req.params;
    const service = await Service.findById(new ObjectId(id));

    if (!service) {
        throw new Error("No service exist with this service id.");
    }

    const inquiryUpdate = await Service.findByIdAndUpdate(id, { $set: { status: true } }, { new: true });

    const response = responseJson(true, inquiryUpdate, 'Service is inactive.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const service = await Service.findOne({ _id: id, counselor: req.user._id });

    if (!service) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await service.deleteOne();
    const response = responseJson(true, {}, 'Service deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;
