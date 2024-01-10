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

    const query = { student: new ObjectId(req.user._id) };

    const orConditions = [];

    if (search) {
        orConditions.push(
            { 'counselor.first_name': { $regex: new RegExp(search, 'i') } },
            { 'counselor.last_name': { $regex: new RegExp(search, 'i') } },
        );
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
    }

    const counselors = StudentInCounselor.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'counselor',
                foreignField: '_id',
                as: 'counselor',
                pipeline: [
                    {
                        $addFields: { name: { $concat: ['$first_name', ' ', '$last_name'] } }
                    },
                    {
                        $project: { first_name: 1, last_name: 1, _id: 1, role: 1, name: 1 }
                    }
                ]
            },
        },
        {
            $unwind: '$counselor'
        },
        {
            $match: query
        }
    ]);

    const data = await StudentInCounselor.aggregatePaginate(counselors, options);

    if (!data) {
        const response = responseJson(true, data, 'No Data Found', StatusCodes.OK, []);
        return res.status(StatusCodes.OK).json(response);
    }
    const response = responseJson(true, data, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



module.exports = router;




