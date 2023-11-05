const express = require("express");
const mongoose = require("mongoose");


const router = express.Router();
const responseJson = require("../../../../utils/responseJson");

const CommunityPost = require("../../../../models/CommunityPost");
const CommunityFollowedAccount = require("../../../../models/CommunityFollowedAccount")


const ObjectId = mongoose.Types.ObjectId;

router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        populate: [{ path: 'following' }],
        sort: { _id: -1 }
    }

    const query = { follower: req.user._id };

    const communityFollowedAccounts = await CommunityFollowedAccount.paginate(query, options);
    const response = responseJson(true, communityFollowedAccounts, '', 200);
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