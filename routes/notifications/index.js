const express = require("express");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const admin = require('firebase-admin');


const responseJson = require("../../utils/responseJson");
const router = express.Router();

const Notification = require("../../models/Notification");
const ObjectId = mongoose.Types.ObjectId;


// const serviceAccount = require("../../serviceAccount.json")

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

// router.get('/', async (req, res) => {
//     const { limit, page, search } = req.query;

//     const options = {
//         limit: parseInt(limit || 10),
//         page: parseInt(page || 1),
//         sort: { createdAt: -1 }
//     }

//     const query = {
//         isRead: false,
//         $or: [
//             { targetUser: { $exists: false } },  // Global notifications
//             { targetUser: new ObjectId(req.user._id) }  // Notifications specifically for the user
//         ],
//     }

//     const notifications = await Notification.paginate(query, options);

//     const response = responseJson(true, notifications, '', StatusCodes.OK, []);
//     return res.status(200).json(response);

// });


// router.get('/push-notification/:token/:count', async (req, res) => {

//     const { token, count } = req.params;
//     const message = {
//         data: {
//             type: 'admin',
//             message: count,
//         },
//         token: token,
//     };

//     await admin.messaging().send(message)
// });


router.patch('/clear', async (req, res) => {
    const update = await Notification.updateMany({ targetUser: new ObjectId(req.user._id), isRead: false }, { isRead: true });
    const response = responseJson(true, [], 'notifications cleared', StatusCodes.OK, []);
    return res.status(200).json(response);
});



module.exports = router;  