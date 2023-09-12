const express = require("express");
const { StatusCodes } = require("http-status-codes");

const responseJson = require("../../../utils/responseJson");
const User = require("../../../models/User");
const Student = require("../../../models/Student");
const Counselor = require("../../../models/Counselor");
const StudentInCounselor = require("../../../models/StudentInCounselor");

const router = express.Router();

router.get('/all', async (req, res) => {


    // const data = await User.paginate({}, {...req.query});
    // return res.status(StatusCodes.OK).json(data);

    const { limit, page } = req.query;
    const options = {
        limit,
        page,
        populate: 'user_id',
        query: { user_id: req.user.id }
    }

    const data = await StudentInCounselor.paginate({}, { ...options });

    if (!data) {
        const response = responseJson(true, data, 'No Data Found', StatusCodes.OK, []);
        return res.status(StatusCodes.OK).json(response);
    }
    const response = responseJson(true, data, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


// add test in student 
// add task in student 

module.exports = router;