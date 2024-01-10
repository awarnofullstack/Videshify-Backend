const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");
const validate = require("../../../utils/validateHandler");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Ticket = require("../../../models/Ticket");
const { makeMoved } = require("../../../utils/fileUpload");


const ObjectId = mongoose.Types.ObjectId;
const createTicketValidationChain = [
    body('subject').notEmpty().trim().toLowerCase().withMessage('subject is required field.'),
    body('message').notEmpty().trim().toLowerCase().withMessage('message is required field.'),
    body('priority').trim().toLowerCase(),
];

router.get("/", async (req, res) => {
    const { limit, page, search, status } = req.query;

    const query = { createdBy: req.user._id };

    const options = {
        limit,
        page,
        populate: [{ path: 'createdBy', select: 'first_name last_name' }],
        sort: { _id: -1 }
    }

    if (status) {
        query.status = status
    }

    if (search) {
        query.ticketId = { $regex: `${search}`, $options: 'i' }
    }

    // if (search) {
    //     query.subject = { $regex: `${search}`, $options: 'i' }
    // }

    const tickets = await Ticket.paginate(query, options);
    const response = responseJson(true, tickets, '', 200);
    return res.status(200).json(response);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: new ObjectId(id), createdBy: req.user._id }).populate('createdBy', 'first_name last_name');

    if (!ticket) {
        throw new Error("Invalid document id, no record found.");
    }

    const response = responseJson(true, ticket, '', 200);
    return res.status(200).json(response);
});

router.post("/", createTicketValidationChain, validate, async (req, res) => {
    const id = req.user._id;

    const { message } = req.body;
    const respond = { _id: new ObjectId(), message, sender: 'user' };

    if (req.files?.attachment) {
        respond.attachment = makeMoved(req.files.attachment);
    }

    const ticketsCount = await Ticket.find().countDocuments();

    const ticketCreate = new Ticket({ createdBy: id, ...req.body, ticketId: ticketsCount + 1 });
    ticketCreate.responds.push(respond);
    await ticketCreate.save();

    const response = responseJson(true, ticketCreate, 'Ticket created.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: new ObjectId(id) });

    if (!ticket) {
        throw new Error("Invalid document id, no record found.");
    }

    const newRespond = { _id: new ObjectId(), message: req.body.message, sender: 'user' }

    if (req.files?.attachment) {
        newRespond.attachment = makeMoved(req.files.attachment);
    }

    const ticketUpdate = await Ticket.findByIdAndUpdate(new ObjectId(id), { $push: { responds: newRespond } }, { new: true });

    const response = responseJson(true, ticketUpdate, 'Reply sent.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


router.put("/:id/close", async (req, res) => {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: new ObjectId(id) });

    if (!ticket) {
        throw new Error("Invalid document id, no record found.");
    }

    const ticketUpdate = await Ticket.findByIdAndUpdate(new ObjectId(id), { $set: { status: 'closed' } }, { new: true });

    const response = responseJson(true, ticketUpdate, 'Ticket has been closed.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id/open", async (req, res) => {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: new ObjectId(id) });

    if (!ticket) {
        throw new Error("Invalid document id, no record found.");
    }

    const ticketUpdate = await Ticket.findByIdAndUpdate(new ObjectId(id), { $set: { status: 'open' } }, { new: true });

    const response = responseJson(true, ticketUpdate, 'Ticket has been opened.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;