const express = require("express");
const router = express.Router();

const auth = require("./auth");
const account = require("./account");
const student = require("./student");
const member = require("./member");
const service = require("./services");
const schedule = require("./schedule");
const inquiry = require("./inquiry");

const { authenticateToken, authorizeRoles, authorizeApproved } = require("../../middleware/authHandler");

router.use('/auth', auth);
router.use('/account', authenticateToken, authorizeRoles('counselor'), account);
router.use('/student', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], student);
router.use('/member', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], member);
router.use('/inquiry', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], inquiry);
router.use('/schedule', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], schedule);
router.use('/service', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], service);

module.exports = router;