const axios = require('axios');

const createMeeting = async ({ topic, duration, start_time, token }) => {
    let data = JSON.stringify({
        agenda: "Use the credentials to access Zoom APIs from your app. Make sure to securely store the credentials. Do not store them in public repositories.",
        duration: duration,
        start_time: start_time,
        topic: topic,
        pre_schedule: false,
        settings: {
            alternative_hosts_email_notification: true,
            audio: "telephony",
            participant_video: true,
            jbh_time: 5,
            join_before_host: false,
            registrants_confirmation_email: true,
            timezone: "Asia/Kolkata"
        },
        type: 2
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.zoom.us/v2/users/me/meetings',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: data
    };

    const response = await axios.request(config)

    console.log("response zoom", response.data);
    return response.data;
}


module.exports = { createMeeting }