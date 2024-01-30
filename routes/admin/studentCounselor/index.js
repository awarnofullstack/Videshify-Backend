const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")

const User = require("../../../models/User");
const StudentCounselor = require("../../../models/StudentCounselor");
const CounselorTestimonial = require("../../../models/CounselorTestimonial");
const StudentInCounselor = require("../../../models/StudentInCounselor");
const Student = require("../../../models/Student");
const responseJson = require("../../../utils/responseJson");
const Schedule = require("../../../models/Schedule");
const WalletTransaction = require("../../../models/WalletTransaction");

const ObjectId = mongoose.Types.ObjectId;


router.get('/', async (req, res) => {
    const { limit, page, search } = req.query;

    const options = {
        limit,
        page,
    }

    const orConditions = [];

    const query = {};

    if (search) {
        orConditions.push(
            { "user_id.name": { $regex: search, $options: 'i' } },
            { "user_id.email": { $regex: search, $options: 'i' } },
        )
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
    }

    const counselors = StudentCounselor.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_id',
                pipeline: [
                    {
                        $addFields: { name: { $concat: ["$first_name", " ", "$last_name"] }, id: "$_id" }
                    },
                    {
                        $project: { first_name: 1, last_name: 1, email: 1, role: 1, createdAt: 1, name: 1, id: 1, approved: 1 }
                    }
                ]
            }
        },
        {
            $unwind: "$user_id"
        },
        {
            $project: { user_id: 1, _id: 1 }
        },
        {
            $match: query
        }
    ])

    const data = await StudentCounselor.aggregatePaginate(counselors, options);

    const response = responseJson(true, data, '', 200);
    return res.status(200).json(response)
});

router.get('/:id/profile', async (req, res) => {
    const { id } = req.params;
    const counselors = await StudentCounselor.findOne({ user_id: id }).populate({ path: 'user_id', select: '_id first_name last_name email phone role' });;

    if (!counselors) {
        throw new Error('No counselor profile found with this user id.');
    }

    const response = responseJson(true, counselors, '', 200);
    return res.status(200).json(response)
});

router.get("/:id/testimonials", async (req, res) => {

    const { id } = req.params;
    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        sort: { _id: -1 },
    }

    const testimonials = await CounselorTestimonial.paginate({ counselor: new ObjectId(id) }, options);
    const response = responseJson(true, testimonials, '', 200);
    return res.status(200).json(response);
})

router.get('/:id/students', async (req, res) => {
    const { id } = req.params;
    const counselors = await StudentCounselor.findOne({ user_id: id });
    if (!counselors) {
        throw new Error('No counselor profile found with this user id.');
    }

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        populate: [{ path: 'student', select: 'first_name last_name _id email' }],
    }

    const data = await StudentInCounselor.paginate({ counselor: id }, options);

    if (!data || data.docs.length == 0) {
        const response = responseJson(true, data, 'No Data Found', 200, []);
        return res.status(200).json(response);
    }

    const response = responseJson(true, data, '', 200, []);
    return res.status(200).json(response);
});


router.get("/:id/payments", async (req, res) => {

    const { id } = req.params;
    const counselors = await StudentCounselor.findOne({ user_id: id })
        ;
    if (!counselors) {
        throw new Error('No counselor profile found with this user id.');
    }

    const { limit, page, search } = req.query;

    const options = {
        limit: parseInt(limit || 10),
        page: parseInt(page || 1),
        sort: { _id: -1 }
    }

    const query = { user: new ObjectId(id) }

    if (search) {
        query.reference = { $regex: `${search}`, $options: 'i' }
    }

    const walletPipeline = WalletTransaction.aggregate([
        {
            $lookup: {
                from: 'schedules',
                localField: 'schedule',
                foreignField: '_id',
                as: 'schedules',
                pipeline: [
                    {
                        $lookup: {
                            from: "payments",
                            localField: "payment_ref",
                            foreignField: "_id",
                            as: "payment"
                        }
                    },
                    {
                        $addFields: { price: { $arrayElemAt: ["$payment.amount", 0] } }
                    },
                    {
                        $project: { payment: 0 }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$schedules",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $match: query
        },
    ])

    const wallets = await WalletTransaction.aggregatePaginate(walletPipeline, options);


    const payments = await StudentCounselor.findOne({ user_id: new ObjectId(id) }).lean()

    const recentPayment = await WalletTransaction.findOne({ user: new ObjectId(id) }).sort({ _id: -1 }).lean();

    const withdrawn = await WalletTransaction.aggregate([
        {
            $match: { $and: [{ user: new ObjectId(id) }, { type: 'debit' }] }
        },
        {
            $group: {
                _id: "$user",
                sum: { $sum: '$amount' }
            }
        },
        {
            $project: { _id: 0, sum: 1 }
        }
    ]);

    const tile = { totalAmount: payments?.walletBalance || 0, recentPayment: recentPayment?.amount || 0, totalWithdraw: withdrawn[0]?.sum || 0 }


    const response = responseJson(true, { wallets, tile }, '', 200);
    return res.status(200).json(response);
});

router.get('/:id/schedules', async (req, res) => {
    const { id } = req.params;
    const { limit, page } = req.query;

    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }]
    }
    const query = { counselor: id };

    const members = await Schedule.paginate(query, options);
    const response = responseJson(true, members, '', 200);
    return res.status(200).json(response);
});

router.get('/:id/schedules-past', async (req, res) => {
    const { id } = req.params;
    const { limit, page } = req.query;

    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }]
    }
    const query = { counselor: id };
    query.start_time = { $lt: new Date() }

    const members = await Schedule.paginate(query, options);
    const response = responseJson(true, members, '', 200);
    return res.status(200).json(response);
});

router.get('/:id/schedules-upcoming', async (req, res) => {
    const { id } = req.params;
    const { limit, page } = req.query;

    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'assigned_to', select: ['name', 'profile'] }]
    }
    const query = { counselor: id };
    query.start_time = { $gte: new Date() }

    const members = await Schedule.paginate(query, options);
    const response = responseJson(true, members, '', 200);
    return res.status(200).json(response);
});


router.get("/:id/approve", async (req, res) => {
    const { id } = req.params;

    const findUser = await User.findById(id);

    if (!findUser) {
        throw new Error('Counselor id is invalid.')
    }
    if (findUser.approved) {
        throw new Error('Counselor profile already approved.')
    }

    const approvedUser = await User.findByIdAndUpdate(id, {
        $set: {
            approved: true
        }
    }, { new: true });

    const response = responseJson(true, approvedUser, 'Account approved', 200, []);
    return res.status(200).json(response);
});


router.delete("/:id/delete", async (req, res) => {
    const { id } = req.params;

    const findUser = await User.findById(id).deleteOne();
    const findCounselor = await StudentCounselor.findOne({ user_id: id }).deleteOne();

    const response = responseJson(true, null, 'Account deleted', 200, []);
    return res.status(200).json(response);
});


router.get('/:id/reports', async (req, res) => {
    const { id } = req.params;

    const report = {
        totalReceivedAmount: 0,
        lastReceivedAmount: 0,
        totalAmountRemains: 0,
        totalSessions: 0,
        counselings: 0,
        totalStudent: 0,
        upcomingSchedules: 0,
        pageViews: 0,
        totalServices: 0,
    }
    const counselor = await StudentCounselor.findOne({ user_id: id });
    if (!counselor) {
        throw new Error('counselor id is invalid or missing.');
    }

    report.totalSessions = await counselor.getSessionsCount();
    report.totalStudent = await counselor.getStudentsCount();

    const response = responseJson(true, report, '', 200);
    return res.status(200).json(response);
});

module.exports = router;