const jwt = require('jsonwebtoken');
const { StatusCodes } = require("http-status-codes")
const responseJson = require("../utils/responseJson");

function authenticateToken(req, res, next) {
    let token = req.header('Authorization');

    if (!token) {
        const response = responseJson(false, null, 'Access denied. Token missing.', StatusCodes.UNAUTHORIZED);
        return res.status(200).json(response);
    }

    token = token.replace("Bearer ", "");

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            console.log(err);
            const response = responseJson(false, null, 'You are not logged in', StatusCodes.UNAUTHORIZED);
            return res.status(200).json(response);
        }

        req.user = user.user; // Store the user data from the token
        next();
    });
}

function fetchToken(req, res, next) {
    let token = req.header('Authorization');

    if (token) {
        token = token.replace("Bearer ", "");
        jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
            if (!err) {
                req.user = user.user;
            }
            next();
        });
    }
}

function authorizeRoles(roles) {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (roles.includes(userRole)) {
            next();
        } else {
            const response = responseJson(false, null, 'Access denied. Insufficient role.', StatusCodes.UNAUTHORIZED);
            res.status(200).json(response);
        }
    };
}

function authorizeApproved(req, res, next) {
    const approved = req.user.approved;

    if (approved) {
        next();
    } else {
        const response = responseJson(false, null, 'Account is in pending status.', StatusCodes.UNAUTHORIZED);
        return res.status(StatusCodes.OK).json(response);
    }
}


module.exports = { authenticateToken, authorizeRoles, authorizeApproved,fetchToken };