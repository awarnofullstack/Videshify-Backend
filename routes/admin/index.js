const express = require("express");
const router = express.Router();

const auth = require("./auth/index");
const studentAuth = require("./students/index");
const counselorRoute = require("./counselor/index");

router.use('/auth', auth);
router.use('/student', studentAuth);
router.use('/counselor', counselorRoute);

module.exports = router;