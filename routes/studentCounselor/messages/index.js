const express = require("express");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");

const responseJson = require("../../../utils/responseJson");
const StudentInCounselor = require("../../../models/StudentInCounselor");
const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

router.get('/all', async (req, res) => {

    const { limit, page, search } = req.query;

    const options = {
        limit,
        page,
    }

    const query = { counselor: new ObjectId(req.user._id) };

    const orConditions = [];

    if (search) {
        orConditions.push(
            { 'counselor.name': { $regex: new RegExp(search, 'i') } },
        );
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
    }

    const students = StudentInCounselor.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'student',
                foreignField: '_id',
                as: 'user',
                pipeline: [
                    {
                        $addFields: { name: { $concat: ['$first_name', ' ', '$last_name'] } }
                    },
                    {
                        $project: { first_name: 1, last_name: 1, _id: 1, role: 1, name: 1 }
                    },
                ],
            },
        },
        {
            $lookup: {
                from: 'students',
                localField: 'student',
                foreignField: 'user_id',
                as: 'students',
                pipeline: [
                    {
                        $addFields: { name: '$preferred_name', profile: { $concat: [process.env.BASE_URL, '/static/', '$profile'] } }
                    },
                    {
                        $project: { name: 1, profile: 1 }
                    },
                ]
            },
        },
        {
            $addFields: {
                nonEmptyFields: {
                    $filter: {
                        input: [
                            { $arrayElemAt: ["$students", 0] },
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
            $unwind: '$user'
        },
        {
            $match: query
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: [
                        { $arrayElemAt: ['$nonEmptyFields', 0] },
                        {
                            student: '$user',
                            counselor: '$counselor',
                        },
                    ],
                },
            },
        },
    ]);

    const data = await StudentInCounselor.aggregatePaginate(students, options);

    if (!data) {
        const response = responseJson(true, data, 'No Data Found', StatusCodes.OK, []);
        return res.status(StatusCodes.OK).json(response);
    }
    const response = responseJson(true, data, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



module.exports = router;




