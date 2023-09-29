const express = require("express");
const router = express.Router();

const {authenticateToken, authorizeRoles} = require("../../middleware/authHandler");

const auth = require("./auth/index");
const profile = require("./profile/index");

router.use('/auth', auth);
router.use('/profile',[authenticateToken, authorizeRoles('student')], profile);

module.exports = router;