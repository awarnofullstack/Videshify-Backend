const express = require("express");
const router = express.Router();

const User = require("../../../models/User");
const responseJson = require("../../../utils/responseJson");

router.get("/:id/approve", async (req, res) => {
    const { id } = req.params;

    const findUser = await User.findById(id);
    findUser.approved = true;
    findUser.save();

    const response = responseJson(true, findUser, 'account approved', 200, []);
    return res.status(200).json(response);
});


module.exports = router;