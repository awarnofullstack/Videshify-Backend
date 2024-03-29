const admin = require('firebase-admin');

const serviceAccount = require("../serviceAccount.json");
const User = require('../models/User');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const sendInquiry = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user || !user?.fcmToken) {
            return
        }

        const token = user.fcmToken;
        const message = {
            data: {
                type: 'admin',
                message: 'true',
            },
            token,
        };

        return await admin.messaging().send(message)
    } catch (error) {
        console.log("fcm error");
    }
};


module.exports = { sendInquiry };  