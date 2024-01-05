const express = require("express");
const mongoose = require("mongoose");


const router = express.Router();
const responseJson = require("../../../../utils/responseJson");

const User = require("../../../../models/User");
const CommunityPost = require("../../../../models/CommunityPost");
const CommunityPostLike = require("../../../../models/CommunityPostLike");
const CommunityPostComment = require("../../../../models/CommunityPostComment");
const CommunityFollowedAccount = require("../../../../models/CommunityFollowedAccount");
const CommunitySavedPost = require("../../../../models/CommunitySavedPost");


const ObjectId = mongoose.Types.ObjectId;

router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
    }

    const posts =
        CommunityPost.aggregate([
            {
                $lookup: {
                    from: 'communitypostlikes',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'likes',
                },
            },
            {
                $lookup: {
                    from: 'communitypostcomments',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'comments',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { authorId: '$author' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$authorId'] },
                            },
                        },
                        {
                            $project: {
                                name: { $concat: ['$first_name', ' ', '$last_name'] },
                                role: 1,
                            },
                        },
                    ],
                    as: 'authorInfo',
                },
            },
            {
                $lookup: {
                    from: 'communityfollows',
                    let: { authorId: '$authorInfo._id', authorizedUserId: new ObjectId(req.user._id) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$following', '$$authorId'] },
                                        { $eq: ['$follower', '$$authorizedUserId'] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                hasFollowed: { $literal: true },
                            },
                        },
                    ],
                    as: 'followInfo',
                },
            },
            {
                $addFields: {
                    likeCount: { $size: '$likes' },
                    commentCount: { $size: '$comments' },
                    hasFollowed: { $ifNull: [{ $arrayElemAt: ['$followInfo.hasFollowed', 0] }, false] },
                },
            },
            {
                $project: {
                    text: 1,
                    content: 1,
                    docUrl: { $concat: [process.env.BASE_URL, '/static/', '$content.url'] },
                    postBy: { $arrayElemAt: ['$authorInfo', 0] },
                    likeCount: 1,
                    createdAt: 1,
                    hasFollowed: 1,
                    commentCount: 1,
                    role: { $arrayElemAt: ['$authorInfo.role', 0] },
                },
            },
            {
                $lookup: {
                    from: 'students', // Default collection name
                    let: { role: '$role', postByUserId: '$postBy._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user_id', '$$postByUserId'] },
                                        { $eq: ['$$role', 'student'] },
                                    ],
                                },
                            },
                        },
                        {
                            $addFields: {
                                profile: { $concat: [process.env.BASE_URL, '/static/', '$profile'] }
                            }
                        },
                        {
                            $project: {
                                author_name: '$preferred_name',
                                profile: 1
                            }
                        }
                    ],
                    as: 'studentData',
                },
            },
            {
                $lookup: {
                    from: 'counselors', // Default collection name
                    let: { role: '$role', postByUserId: '$postBy._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user_id', '$$postByUserId'] },
                                        { $eq: ['$$role', 'counselor'] },
                                    ],
                                },
                            },
                        },
                        {
                            $addFields: {
                                profile: { $concat: [process.env.BASE_URL, '/static/', '$profile'] }
                            }
                        },
                        {
                            $project: {
                                author_name: '$agency_name',
                                profile: 1
                            }
                        }
                    ],
                    as: 'counselorData',
                },
            },
            {
                $lookup: {
                    from: 'studentcounselors', // Default collection name
                    let: { role: '$role', postByUserId: '$postBy._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$user_id', '$$postByUserId'] },
                                        { $eq: ['$$role', 'student counselor'] },
                                    ],
                                },
                            },
                        },
                        {
                            $addFields: {
                                profile: { $concat: [process.env.BASE_URL, '/static/', '$profile'] }
                            }
                        },
                        {
                            $project: {
                                author_name: '$name',
                                profile: 1
                            }
                        }
                    ],
                    as: 'studentCounselorData',
                },
            },
            {
                $addFields: {
                    nonEmptyFields: {
                        $filter: {
                            input: [
                                { $arrayElemAt: ["$studentData", 0] },
                                { $arrayElemAt: ["$counselorData", 0] },
                                { $arrayElemAt: ["$studentCounselorData", 0] },
                            ],
                            as: 'field',
                            cond: { $ne: ['$$field', []] },
                        },
                    },
                },
            },
            {
                $addFields: {
                    nonEmptyFields: {
                        $cond: {
                            if: { $eq: [{ $size: '$nonEmptyFields' }, 0] },
                            then: [{}], // Use an empty array if there are no non-empty fields
                            else: '$nonEmptyFields',
                        },
                    },
                },
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { $arrayElemAt: ['$nonEmptyFields', 0] },
                            {
                                postId: '$_id',
                                text: '$text',
                                content: '$content',
                                createdAt: '$createdAt',
                                docUrl: '$docUrl',
                                author: '$author',
                                postBy: '$postBy',
                                likeCount: '$likeCount',
                                commentCount: '$commentCount',
                                followed: '$hasFollowed'
                            },
                        ],
                    },
                },
            },
        ]);

    const communityPost = await CommunityPost.aggregatePaginate(posts, options)

    const response = responseJson(true, communityPost, '', 200);
    return res.status(200).json(response);
});


router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const communityPost = await CommunityPost.findOne({ _id: new ObjectId(id) });
    if (!communityPost) {
        throw new Error("Invalid document id, no record found.");
    }
    const likes = await CommunityPostLike.find({ post: id }).countDocuments()
    const comments = await CommunityPostComment.find({ post: id }).countDocuments()

    const response = responseJson(true, { post: communityPost, likes, comments }, '', 200);
    return res.status(200).json(response);
});


// like or dislike post 
router.post("/:id/action", async (req, res) => {
    const { id } = req.params;
    const communityPost = await CommunityPost.findOne({ _id: new ObjectId(id) });

    if (!communityPost) {
        throw new Error("Invalid document id, no record found.");
    }

    const isLiked = await CommunityPostLike.findOne({ post: id, likedBy: req.user._id });

    if (isLiked) {
        await isLiked.deleteOne();
        const response = responseJson(true, {}, 'You unliked this post', 200);
        return res.status(200).json(response);
    }

    await CommunityPostLike.create({ post: id, likedBy: req.user._id });
    const response = responseJson(true, {}, 'You liked this post', 200);
    return res.status(200).json(response);
});

// comment on post
router.post("/:id/comment", async (req, res) => {
    const { id } = req.params;
    const communityPost = await CommunityPost.findOne({ _id: new ObjectId(id) });

    if (!communityPost) {
        throw new Error("Invalid document id, no record found.");
    }

    const postNewComment = {
        ...req.body,
        post: id,
        sender: req.user._id
    }

    const communityPostComment = await CommunityPostComment.create(postNewComment);

    const response = responseJson(true, communityPostComment, 'Comment added.', 200);
    return res.status(200).json(response);
});

// Save post
router.post("/:post_id/save", async (req, res) => {
    const { post_id } = req.params;
    const communityPost = await CommunityPost.findOne({ _id: new ObjectId(post_id) });

    if (!communityPost) {
        throw new Error("Invalid document id, no record found.");
    }

    const communitySavedPost = await CommunitySavedPost.findOne({ post: post_id, user: req.user._id });

    if (communitySavedPost) {
        await communitySavedPost.deleteOne();
        const response = responseJson(true, { saved: false }, 'You have unsaved this post.');
        return res.status(200).json(response)
    }

    await CommunitySavedPost.create({ user: req.user._id, post: post_id });
    const response = responseJson(true, { saved: true }, 'You have saved this post.');
    return res.status(200).json(response);
});


// Follow account
router.post("/:author_id/follow", async (req, res) => {
    const { author_id } = req.params;

    const isAuthor = await User.findOne({ _id: author_id }).lean();
    if (!isAuthor) {
        throw new Error("Invalid document id, no record found.");
    }

    const isFollowed = await CommunityFollowedAccount.findOne({ follower: req.user._id, following: author_id });

    if (isFollowed) {
        await isFollowed.deleteOne();
        const response = responseJson(true, { following: false }, 'You have unfollowed this account.');
        return res.status(200).json(response)
    }

    await CommunityFollowedAccount.create({ follower: req.user._id, following: author_id });
    const response = responseJson(true, { following: true }, 'You have followed this account.');
    return res.status(200).json(response);
});

module.exports = router;