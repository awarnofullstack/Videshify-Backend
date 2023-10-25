const express = require("express");
const router = express.Router();

const { authenticateToken, authorizeRoles } = require("../../middleware/authHandler");

const auth = require("./auth");
const profile = require("./student");
const counselor = require("./counselor")

router.use('/auth', auth);
router.use('/student', [authenticateToken, authorizeRoles('student')], profile);
router.use('/counselor', counselor);

module.exports = router;