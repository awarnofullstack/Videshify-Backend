const profile = require("./profile");
const academic = require("./academics");
const testing = require("./testings");
const career = require("./career");
const activity = require("./activity");


const express = require("express");
const router = express.Router();

router.use("/profile", profile);
router.use("/academic", academic);
router.use("/testing", testing);
router.use("/career", career);
router.use("/activity", activity);


module.exports = router;