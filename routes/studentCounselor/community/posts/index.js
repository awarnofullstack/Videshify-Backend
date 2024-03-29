const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const { StatusCodes } = require("http-status-codes");

const { body } = require("express-validator");
const validate = require("../../../../utils/validateHandler");

const { makeMoved } = require("../../../../utils/fileUpload");
const { removeFile } = require("../../../../utils/removeFile");

const router = express.Router();
const responseJson = require("../../../../utils/responseJson");

const CommunityPost = require("../../../../models/CommunityPost");
const CommunityPostLike = require("../../../../models/CommunityPostLike");
const CommunityPostComment = require("../../../../models/CommunityPostComment");


const ObjectId = mongoose.Types.ObjectId;


const postCreateValidationChain = [
    body('text').notEmpty().withMessage('post message is required').bail().toLowerCase().trim()
];

router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
    }

    const query = { author: { $eq: new ObjectId(req.user._id) } }

    const posts = CommunityPost.aggregate(
        [
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
                    let: { authorId: { $arrayElemAt: ['$authorInfo._id', 0] }, authorizedUserId: new ObjectId(req.user._id) },
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
                $match: query
            },
            {
                $project: {
                    text: 1,
                    content: 1,
                    category: 1,
                    docUrl: {
                        $concat: [process.env.BASE_URL, {
                            $cond: {
                                if: { $eq: ['$content.type', 'image'] },
                                then: { $concat: ['/static/', '$content.url'] },
                                else: {
                                    $cond: {
                                        if: { $eq: ['$content.type', 'video'] },
                                        then: { $concat: ['/video/', '$content.url'] },
                                        else: null // Add additional conditions as needed
                                    }
                                }
                            }
                        }]
                    },
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
                                category: "$category",
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
        ]
    );
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

router.post("/", postCreateValidationChain, validate, async (req, res) => {
    const id = req.user._id;

    if (req.files?.content) {
        const { mimetype, size } = req.files.content;

        const mime = mimetype.split("/")
        const content = { type: mime[0], size };
        content.extention = mime[1]
        content.url = makeMoved(req.files.content);
        req.body.content = content;
    }

    const createPost = await CommunityPost.create({ author: id, ...req.body });
    const response = responseJson(true, createPost, 'Post uploaded successfuly.', StatusCodes.CREATED);
    return res.status(StatusCodes.CREATED).json(response);

})

router.put("/:id", postCreateValidationChain, validate, async (req, res) => {
    const { id } = req.params;

    const communityPost = await CommunityPost.findOne({ _id: new ObjectId(id) });
    if (!communityPost) {
        throw new Error("Invalid document id, no record found.");
    }

    if (req.files?.content) {
        const { mimetype, size } = req.files.content;

        const mime = mimetype.split("/")
        const content = { type: mime[0], size };
        content.extention = mime[1]
        content.url = makeMoved(req.files.content);
        req.body.content = content;
    }

    const updatedPost = await CommunityPost.findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true });
    const response = responseJson(true, updatedPost, 'Post updated successfuly.', StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);

})

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const communityPost = await CommunityPost.findOne({ _id: new ObjectId(id) }).lean();
    if (!communityPost) {
        throw new Error("Invalid document id, no record found.");
    }

    if (communityPost.content?.url) {
        removeFile(communityPost.content.url)
    }

    await CommunityPost.findByIdAndRemove(new ObjectId(id));
    const response = responseJson(true, {}, 'Post removed.', StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);

})

module.exports = router;