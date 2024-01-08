const express = require("express");
const mongoose = require("mongoose");


const router = express.Router();
const responseJson = require("../../../../utils/responseJson");

const CommunitySavedPost = require("../../../../models/CommunitySavedPost");
const CommunityPost = require("../../../../models/CommunityPost");


const ObjectId = mongoose.Types.ObjectId;

router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
    }

    const communitySavedPost = await CommunitySavedPost.find({ user: new ObjectId(req.user._id) }).select(['post']).lean();

    let savedPostIds = communitySavedPost.map((item) => item._id);

    const query = { _id: { $in: savedPostIds } }

    const savedPosst = CommunitySavedPost.aggregate([
        {
            $match: { user: new ObjectId(req.user._id) }
        },
        {
            $lookup: {
                from: 'communityposts', // Use the correct collection name
                localField: 'post',
                foreignField: '_id',
                as: 'savedPosts',
            },
        },
        {
            $lookup: {
                from: 'communitypostlikes',
                localField: 'post',
                foreignField: 'post',
                as: 'likes',
            },
        },
        {
            $lookup: {
                from: 'communitypostcomments',
                localField: 'post',
                foreignField: 'post',
                as: 'comments',
            },
        },

        // users lookup 
        {
            $lookup: {
                from: 'users',
                let: { authorId: '$savedPosts.author' },
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
        // lookups according to roles
        {
            $lookup: {
                from: 'students', // Default collection name
                let: { role: '$authorInfo.role', postByUserId: '$authorInfo._id' },
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
                let: { role: '$authorInfo.role', postByUserId: '$authorInfo._id' },
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
                let: { role: '$authorInfo.role', postByUserId: '$authorInfo._id' },
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
                            author_name: { $concat: ['$authorInfo.first_name', ' ', '$authorInfo.last_name'] },
                            profile: 1
                        }
                    }
                ],
                as: 'studentCounselorData',
            },
        },
        // merge fields
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
                            postId: { $arrayElemAt: ['$savedPosts._id', 0] },
                            text: { $arrayElemAt: ['$savedPosts.text', 0] },
                            content: { $arrayElemAt: ['$savedPosts.content', 0] },
                            docUrl: { $arrayElemAt: ['$savedPosts.docUrl', 0] },
                            author: { $arrayElemAt: ['$savedPosts.author', 0] },
                            postBy: { $arrayElemAt: ['$savedPosts.postBy', 0] },
                            likeCount: { $size: '$likes' },
                            commentCount: { $size: '$comments' },
                        },
                    ],
                },
            },
        },
    ]);

    const savedPost = CommunityPost.aggregate([
        {
            $match: query
        },
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
            $project: {
                author: { $arrayElemAt: ['$authorInfo.first_name', 0] },
                postBy: { $arrayElemAt: ['$authorInfo', 0] },
                text: 1,
                postId: '$_id',
                content: 1,
                createdAt: 1,
                docUrl: { $concat: [process.env.BASE_URL, '/static/', '$content.url'] },
                likeCount: { $size: '$likes' },
                commentCount: { $size: '$comments' },
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
                        },
                    ],
                },
            },
        },
    ]);

    const communityPost = await CommunitySavedPost.aggregatePaginate(savedPost, options)

    const response = responseJson(true, communityPost, '', 200);
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