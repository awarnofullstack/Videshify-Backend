const axios = require('axios');


let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: process.env.ZOOM_AUTH_TOKEN_FETCH,
    headers: {
        Authorization: `Basic T1dTSVM2VjlUQWFINHVTTzUzeEhOUTpOWDBKcWFIYVJFU3lSenlCSzV5QXB0QTFtRjJmUlVqUQ==`
    },
    data: ''
};

const genZoomToken = async (req, res, next) => {
    const response = await axios.request(config)
    const token = await response.data;
    req.zoom = token;
    next();
}


module.exports = { genZoomToken }