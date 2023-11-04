const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");
const validate = require("../../../utils/validateHandler")


const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Blog = require("../../../models/Blog");
const { makeMoved } = require("../../../utils/fileUpload");


const ObjectId = mongoose.Types.ObjectId;
const createBlogValidationChain = [
    body('title').notEmpty().trim().toLowerCase().withMessage('Title is required.'),
    body('description').notEmpty().trim().withMessage('Description is required.'),
    body('category').notEmpty().trim().withMessage('Category is required.'),
];


router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 }
    }

    const blogs = await Blog.paginate({}, options);
    const response = responseJson(true, blogs, '', 200);
    return res.status(200).json(response);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findOne({ _id: new ObjectId(id) }).lean();

    if (!blog) {
        throw new Error("Invalid document id, no record found.");
    }

    const response = responseJson(true, blog, '', 200);
    return res.status(200).json(response);
});

router.post("/", [createBlogValidationChain, validate], async (req, res) => {

    const { title } = req.body;

    const blogDoc = await Blog.findOne({ title });

    if (blogDoc) {
        throw new Error('Blog title already used.');
    }

    if (req.files?.primary_image) {
        const pathname = makeMoved(req.files.primary_image);
        req.body.primary_image = pathname;
    }

    if (req.files?.secondary_image) {
        const pathname = makeMoved(req.files.secondary_image);
        req.body.secondary_image = pathname;
    }

    const blogCreate = await Blog.create({ ...req.body });

    const response = responseJson(true, blogCreate, 'Blog created.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findOne({ _id: id });

    if (!blog) {
        throw new Error("Invalid document id, no record found.");
    }

    const { title } = req.body;
    const blogDoc = await Blog.findOne({ title });
    if (blogDoc) {
        throw new Error('Blog title already used.');
    }

    if (req.files?.primary_image) {
        const pathname = makeMoved(req.files.primary_image);
        req.body.primary_image = pathname;
    }

    if (req.files?.secondary_image) {
        const pathname = makeMoved(req.files.secondary_image);
        req.body.secondary_image = pathname;
    }

    const blogUpdate = await Blog.findByIdAndUpdate(new ObjectId(id), { $set: req.body }, { new: true });

    const response = responseJson(true, blogUpdate, 'Blog updated.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findOne({ _id: id });

    if (!blog) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await blog.deleteOne();
    const response = responseJson(true, {}, 'Blog deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;