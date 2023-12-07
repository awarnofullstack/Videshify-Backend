const express = require("express");
const mongoose = require("mongoose");


const router = express.Router();
const responseJson = require("../../../../utils/responseJson");

const CommunityPost = require("../../../../models/CommunityPost");
const CommunityPostLike = require("../../../../models/CommunityPostLike");


const ObjectId = mongoose.Types.ObjectId;

router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'post' }]
    }

    const communityLikedPost = await CommunityPostLike.paginate({}, options);
    const response = responseJson(true, communityLikedPost, '', 200);
    return res.status(200).json(response);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const communityPost = await CommunityPost.findOne({ _id: new ObjectId(id) });

    if (!communityPost) {
        throw new Error("Invalid document id, no record found.");
    }

    const response = responseJson(true, communityPost, '', 200);
    return res.status(200).json(response);
});

module.exports = router;