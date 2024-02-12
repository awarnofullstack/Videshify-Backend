const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../../middleware/authHandler");

const auth = require("./auth");
const profile = require("./student");
const counselor = require("./counselor");
const studentCounselor = require("./studentCounselor");
const inquiry = require("./inquiry");
const schedule = require("./schedules");
const blog = require("./blog");
const ticket = require("./ticket");
const community = require("./community");
const contact = require("./contact");
const rating = require("./rating");
const report = require("./reports");
const messages = require("./messages");
const notification = require("./notification");

router.use('/auth', auth);
router.use('/student', [authenticateToken, authorizeRoles('student')], profile);
router.use('/counselor', counselor);
router.use('/student-counselor', studentCounselor);
router.use('/rating', rating);
router.use('/inquiry', [authenticateToken, authorizeRoles('student')], inquiry);
router.use('/schedule', [authenticateToken, authorizeRoles('student')], schedule);
router.use('/ticket', [authenticateToken, authorizeRoles('student')], ticket);
router.use('/community', [authenticateToken, authorizeRoles('student')], community);
router.use('/contact', contact);
router.use('/blog', blog);
router.use('/messages', [authenticateToken, authorizeRoles('student')], messages);
router.use('/report', [authenticateToken, authorizeRoles('student')], report);
router.use('/notification', [authenticateToken, authorizeRoles('student')], notification);


module.exports = router;