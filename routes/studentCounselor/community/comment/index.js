const express = require("express");
const mongoose = require("mongoose");


const router = express.Router();
const responseJson = require("../../../../utils/responseJson");

const CommunityPost = require("../../../../models/CommunityPost");
const CommunityPostComment = require("../../../../models/CommunityPostComment");


const ObjectId = mongoose.Types.ObjectId;

router.get("/:post/comments", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'sender', select: ['first_name', 'last_name', 'role'] }]
    }

    const communityComment = await CommunityPostComment.paginate({ post: req.params.post }, options);
    const response = responseJson(true, communityComment, '', 200);
    return res.status(200).json(response);
});


module.exports = router;