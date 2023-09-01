const responseJson = require("../utils/responseJson")
const { StatusCodes, ReasonPhrases } = require("http-status-codes")

const notFound = async (req, res) => {
    const response = responseJson(false, null, ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);
    return res.status(StatusCodes.NOT_FOUND).json(response);
}

module.exports = notFound;
