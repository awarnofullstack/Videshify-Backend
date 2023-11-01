const express = require("express");
const router = express.Router();

const auth = require("./auth");
const studentAuth = require("./students");
const counselor = require("./counselor");
const blogs = require("./blogs");


const { authenticateToken, authorizeRoles } = require("../../middleware/authHandler");

router.use('/auth', auth);
router.use('/student', [authenticateToken, authorizeRoles('admin')], studentAuth);
router.use('/counselor', [authenticateToken, authorizeRoles('admin')], counselor);
router.use('/blog', [authenticateToken, authorizeRoles('admin')], blogs);

module.exports = router;