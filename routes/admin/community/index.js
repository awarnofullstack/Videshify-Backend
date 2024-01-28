const express = require("express");
const router = express.Router();

const trending = require("./trending");
const post = require("./posts");
const likes = require("./likes");
const comment = require("./comment");
const saved = require("./saved");
const follow = require("./follow");

router.use("/trending", trending);
router.use("/post", post);
router.use("/likes", likes);
router.use("/comment", comment);
router.use("/saved", saved);
router.use("/follow", follow);

module.exports = router;
