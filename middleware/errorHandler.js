const responseJson = require("../utils/responseJson")
const { getReasonPhrase, StatusCodes, ReasonPhrases } = require("http-status-codes")

const errorHandler = (error, req, res, next) => {

    console.log("__________error______________", error.name);
    if (error.name === 'ValidationError') {
        const response = responseJson(false, null, error.message, StatusCodes.INTERNAL_SERVER_ERROR, []);
        return res.status(StatusCodes.OK).json(response);
    }

    if (error.name === 'ReferenceError') {
        const response = responseJson(false, null, error.message, StatusCodes.INTERNAL_SERVER_ERROR, []);
        return res.status(StatusCodes.OK).json(response);
    }

    if (error.name === 'MongoServerError' && error.code === 11000) {
        const response = responseJson(false, null, 'Account already exist with email or phone!', StatusCodes.INTERNAL_SERVER_ERROR, []);
        return res.status(StatusCodes.OK).json(response);
    }

    if (error) {
        const response = responseJson(false, null, error.message, StatusCodes.INTERNAL_SERVER_ERROR, []);
        return res.status(StatusCodes.OK).json(response);
    }
    next();
}

module.exports = errorHandler;
