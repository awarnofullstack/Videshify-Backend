const express = require("express");
const router = express.Router();

const auth = require("./auth");
const studentAuth = require("./students");
const counselor = require("./counselor");
const studentCounselor = require("./studentCounselor");
const blogs = require("./blogs");
const report = require("./reports");


const { authenticateToken, authorizeRoles } = require("../../middleware/authHandler");

router.use('/auth', auth);
router.use('/student', [authenticateToken, authorizeRoles('admin')], studentAuth);
router.use('/counselor', [authenticateToken, authorizeRoles('admin')], counselor);
router.use('/student-counselor', [authenticateToken, authorizeRoles('admin')], studentCounselor);
router.use('/blog', [authenticateToken, authorizeRoles('admin')], blogs);
router.use('/report', [authenticateToken, authorizeRoles('admin')], report);

module.exports = router;