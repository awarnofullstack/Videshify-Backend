const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../../middleware/authHandler");

const auth = require("./auth");
const profile = require("./student");
const counselor = require("./counselor");
const inquiry = require("./inquiry");
const schedule = require("./schedules");
const blog = require("./blog");

router.use('/auth', auth);
router.use('/student', [authenticateToken, authorizeRoles('student')], profile);
router.use('/counselor', counselor);
router.use('/inquiry', [authenticateToken, authorizeRoles('student')], inquiry);
router.use('/schedule', [authenticateToken, authorizeRoles('student')], schedule);
router.use('/blog', blog);

module.exports = router;