const axios = require('axios');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const StudentCounselor = require('../models/StudentCounselor');
const CounselorMember = require('../models/CounselorMember');

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


const assignSelf = async (req, id) => {

    // const { id } = req.params;

    const schedule = await Schedule.findOne({ _id: id });

    if (!schedule) {
        throw new Error('You are trying to assign to non-existing schedule.');
    }

    const user = await User.findOne({ _id: schedule.counselor }).lean();
    const counselor = await StudentCounselor.findOne({ user_id: schedule.counselor }).lean();
    const member = await CounselorMember.findOne({ counselor: schedule.counselor }).lean();

    let memberId = member?._id;
    if (!member) {
        const newMember = await CounselorMember.create({
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            profile: counselor.profile,
            experience: counselor.experience,
        });

        memberId = newMember._id
    }

    const { duration, topic, start_time } = schedule

    const createLink = await createMeeting({ duration, topic, start_time, token: req.zoom.access_token });

    const updatedSchedule = await Schedule.findByIdAndUpdate(id,
        {
            $set: {
                assigned_to: memberId,
                invite_link: createLink.join_url,
                start_time: createLink.start_time,
                duration: createLink.duration,
                meeting_id: createLink.id
            }
        },
        { new: true }
    );

    // const response = responseJson(true, updatedSchedule, 'Member assigned to schedule successfuly.', StatusCodes.OK, []);
    // return res.status(StatusCodes.OK).json(response);
}


module.exports = { createMeeting, assignSelf }