const express = require("express");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");

const responseJson = require("../../../utils/responseJson");
const StudentInCounselor = require("../../../models/StudentInCounselor");
const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

router.get('/all', async (req, res) => {

    const { limit, page } = req.query;

    const unSelectFields = {
        resetToken: 0,
        createdAt: 0,
        updatedAt: 0,
        password: 0,
        resetTokenExpiry: 0,
        __v: 0
    }

    const options = {
        limit,
        page,
        populate: [{ path: 'counselor', select: unSelectFields }],
    }

    const query = { student: new ObjectId(req.user._id) };


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
    // const data = await StudentInCounselor.paginate(query, { ...options });

    if (!data) {
        const response = responseJson(true, data, 'No Data Found', StatusCodes.OK, []);
        return res.status(StatusCodes.OK).json(response);
    }
    const response = responseJson(true, data, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



module.exports = router;




