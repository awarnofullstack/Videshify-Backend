const express = require("express");
const router = express.Router();

const auth = require("./auth");
const account = require("./account");
const student = require("./student");
const schedule = require("./schedule");
const ticket = require("./ticket");
const community = require("./community");
const service = require("./services");
const message = require("./messages");
const testimonial = require("./testimonial");
const wallet = require("./wallet");
const dashboard = require("./dashboard");
const notification = require("../notifications");

const { authenticateToken, authorizeRoles, authorizeApproved } = require("../../middleware/authHandler");

router.use('/auth', auth);
router.use('/account', authenticateToken, authorizeRoles('student counselor'), account);
router.use('/student', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], student);
router.use('/testimonial', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], testimonial);
router.use('/schedule', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], schedule);
router.use('/dashboard', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], dashboard);
router.use('/service', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], service);
router.use('/wallet', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], wallet);
router.use('/ticket', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], ticket);
router.use('/community', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], community);
router.use('/message', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], message);
router.use('/notification', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], notification);


module.exports = router;