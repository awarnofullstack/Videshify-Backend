const express = require("express");
const router = express.Router();

const User = require("../../../models/User");
const StudentCounselor = require("../../../models/StudentCounselor");
const StudentInCounselor = require("../../../models/StudentInCounselor");
const Student = require("../../../models/Student");
const responseJson = require("../../../utils/responseJson");
const Schedule = require("../../../models/Schedule");



router.get('/', async (req, res) => {
    const { limit, page } = req.query;

    const options = {
        limit,
        page,
        sort: { _id: -1 },
        populate: [{ path: 'user_id', select: 'first_name last_name email phone role approved' }]
    }

    const counselors = await StudentCounselor.paginate({}, options);

    const response = responseJson(true, counselors, '', 200);
    return res.status(200).json(response)
})

router.get('/:id/profile', async (req, res) => {
    const { id } = req.params;
    const counselors = await StudentCounselor.findOne({ user_id: id });

    if (!counselors) {
        throw new Error('No counselor profile found with this user id.');
    }

    const response = responseJson(true, counselors, '', 200);
    return res.status(200).json(response)
});

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
        populate: ['student'],
    }

    const data = await StudentInCounselor.paginate({ counselor: id }, options);

    if (!data || data.docs.length == 0) {
        const response = responseJson(true, data, 'No Data Found', 200, []);
        return res.status(200).json(response);
    }
    const response = responseJson(true, data, '', 200, []);
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