const express = require("express");
const { check, validationResult } = require("express-validator");
const responseJson = require("../../../utils/responseJson");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const router = express.Router();

router.post("/login", [
    check('email').notEmpty().isEmail().trim(),
    check('password').notEmpty().isLength({ min: 8 })
], (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, ReasonPhrases.UNPROCESSABLE_ENTITY, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(response);
    }

    const { email, password } = req.body;
    const response = responseJson(true, req.body, ReasonPhrases.OK, StatusCodes.OK);
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;