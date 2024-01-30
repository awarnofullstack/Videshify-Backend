const express = require("express");
const router = express.Router();

const auth = require("./auth");
const dashboard = require("./dashboard");
const studentAuth = require("./students");
const counselor = require("./counselor");
const studentCounselor = require("./studentCounselor");
const blogs = require("./blogs");
const plans = require("./plans");
const report = require("./reports");
const payment = require("./payments");
const booking = require("./schedules");
const community = require("./community");
const message = require("./messages");
const ticket = require("./ticket");
const wallet = require("./wallet");

const { authenticateToken, authorizeRoles } = require("../../middleware/authHandler");

router.use('/auth', auth);
router.use('/dashboard', [authenticateToken, authorizeRoles('admin')], dashboard);
router.use('/student', [authenticateToken, authorizeRoles('admin')], studentAuth);
router.use('/wallet', [authenticateToken, authorizeRoles('admin')], wallet);
router.use('/payment', [authenticateToken, authorizeRoles('admin')], payment);
router.use('/schedule', [authenticateToken, authorizeRoles('admin')], booking);
router.use('/counselor', [authenticateToken, authorizeRoles('admin')], counselor);
router.use('/student-counselor', [authenticateToken, authorizeRoles('admin')], studentCounselor);
router.use('/blog', [authenticateToken, authorizeRoles('admin')], blogs);
router.use('/community', [authenticateToken, authorizeRoles('admin')], community);
router.use('/message', [authenticateToken, authorizeRoles('admin')], message);
router.use('/plans', [authenticateToken, authorizeRoles('admin')], plans);
router.use('/ticket', [authenticateToken, authorizeRoles('admin')], ticket);
router.use('/report', [authenticateToken, authorizeRoles('admin')], report);

module.exports = router;