const express = require("express");
const router = express.Router();

const auth = require("./auth/index");
const account = require("./account/index");

const { authenticateToken, authorizeRoles } = require("../../middleware/authHandler");

router.use('/auth', auth);
router.use('/account', authenticateToken, authorizeRoles('counselor'), account);

module.exports = router;