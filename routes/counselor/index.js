const express = require("express");
const router = express.Router();

const auth = require("./auth");
const account = require("./account");
const student = require("./student");
const member = require("./member");
const service = require("./services");
const schedule = require("./schedule");
const inquiry = require("./inquiry");
const ticket = require("./ticket");
const message = require("./messages");
const community = require("./community");

const { authenticateToken, authorizeRoles, authorizeApproved } = require("../../middleware/authHandler");

router.use('/auth', auth);
router.use('/account', authenticateToken, authorizeRoles('counselor'), account);
router.use('/student', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], student);
router.use('/member', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], member);
router.use('/inquiry', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], inquiry);
router.use('/schedule', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], schedule);
router.use('/service', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], service);
router.use('/ticket', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], ticket);
router.use('/community', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], community);
router.use('/message', [authenticateToken, authorizeRoles('counselor'), authorizeApproved], message);

module.exports = router;