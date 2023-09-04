const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    let token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token missing.' });
    }

    token = token.replace("Bearer ", "");

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(403).json({ message: 'Invalid token.' });
        }

        req.user = user.user; // Store the user data from the token
        next();
    });
}

function authorizeRoles(roles) {
    return (req, res, next) => {
        const userRole = req.user.role;

        if (roles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Insufficient role.' });
        }
    };
}


module.exports = { authenticateToken, authorizeRoles };