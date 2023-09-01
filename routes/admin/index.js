const express = require("express");
const router = express.Router();

const auth = require("./auth/index");
const studentAuth = require("./students/index");

router.use('/auth', auth);
router.use('/student', studentAuth);

module.exports = router;