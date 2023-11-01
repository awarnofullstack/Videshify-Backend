const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");
const validate = require("../../../utils/validateHandler")


const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Blog = require("../../../models/Blog");


const ObjectId = mongoose.Types.ObjectId;

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
    const blog = await Blog.findOne({ _id: new ObjectId(id) });

    if (!blog) {
        throw new Error("Invalid document id, no record found.");
    }

    const response = responseJson(true, blog, '', 200);
    return res.status(200).json(response);
});

module.exports = router;