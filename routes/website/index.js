const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../../middleware/authHandler");

const auth = require("./auth/index");
const profile = require("./student/index.js");

router.use('/auth', auth);
router.use('/student', [authenticateToken, authorizeRoles('student')], profile);

module.exports = router;