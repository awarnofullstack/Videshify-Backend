const { validationResult } = require("express-validator")
const responseJson = require("./responseJson")
const { ReasonPhrases, StatusCodes } = require("http-status-codes")

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    next();
};


module.exports = validate;