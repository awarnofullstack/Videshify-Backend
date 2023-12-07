const express = require("express");
const router = express.Router();

const auth = require("./auth");
const account = require("./account");
const student = require("./student");
const schedule = require("./schedule");
const ticket = require("./ticket");
const community = require("./community");
const service = require("./services");

const { authenticateToken, authorizeRoles, authorizeApproved } = require("../../middleware/authHandler");

router.use('/auth', auth);
router.use('/account', authenticateToken, authorizeRoles('student counselor'), account);
router.use('/student', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], student);
router.use('/schedule', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], schedule);
router.use('/service', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], service);
router.use('/ticket', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], ticket);
router.use('/community', [authenticateToken, authorizeRoles('student counselor'), authorizeApproved], community);

module.exports = router;