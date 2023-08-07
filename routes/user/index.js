const express = require("express");

const studentRouter = express.Router();

const {index, store} = require("../../controllers/user/auth/authController");

studentRouter.get("/users", index);
studentRouter.get("/store", store);

module.exports = studentRouter;
