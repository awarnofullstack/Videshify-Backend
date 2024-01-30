const express = require("express");
const { StatusCodes } = require("http-status-codes");

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const Report = require("../../../models/Report");

router.get("/", async (req, res) => {

    const { page, limit, search } = req.query;


    const options = {
        page,
        limit,
        sort: { _id: -1 },
        populate: [
            { path: "reportBy", select: 'first_name last_name email phone approved role' },
            { path: "counselor", select: 'first_name last_name email phone approved role' }]
    }


    const reportDoc = await Report.paginate({}, options);

    const response = responseJson(true, reportDoc, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



module.exports = router;