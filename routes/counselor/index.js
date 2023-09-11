const express = require("express");
const router = express.Router();

const auth = require("./auth/index");
const account = require("./account/index");
const student = require("./student/index");

const { authenticateToken, authorizeRoles, authorizeApproved } = require("../../middleware/authHandler");

router.use('/auth', auth);
router.use('/account', authenticateToken, authorizeRoles('counselor'), account);
router.use('/student', authenticateToken, authorizeRoles('counselor'), authorizeApproved, student);

module.exports = router;