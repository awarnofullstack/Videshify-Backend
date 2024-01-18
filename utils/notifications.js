const Notification = require("../models/Notification");

const NOTIFICATIONS = {
    INQUIRY: 'inquiry',
    QUOTATION: 'quotation',
    ADMIN: 'admin',
    ASSIGN: 'assigned',
    RESCHEDULE: 'reschedule',
    RESCHEDULED: 'rescheduled',
    TICKET: 'ticket',
    LIKED: 'liked',
    SAVED: 'saved',
    COMMENT: 'comment',
    REMINDER: 'reminder',
    PAYMENT: 'payment',
};

function createNotificationMessage(type, additionalInfo) {
    switch (type) {
        case NOTIFICATIONS.INQUIRY:
            return `New inquiry received: ${additionalInfo}`;
        case NOTIFICATIONS.QUOTATION:
            return `Quotation sent: ${additionalInfo}`;
        case NOTIFICATIONS.ADMIN:
            return `Announcement: ${additionalInfo}`;
        case NOTIFICATIONS.ASSIGN:
            return `You have been assigned a counselor: ${additionalInfo}`;
        case NOTIFICATIONS.RESCHEDULE:
            return `Event reschedule request: ${additionalInfo}`;
        case NOTIFICATIONS.RESCHEDULED:
            return `Event rescheduled: ${additionalInfo}`;
        case NOTIFICATIONS.TICKET:
            return `New support ticket: ${additionalInfo}`;
        case NOTIFICATIONS.LIKED:
            return `Your post has been liked: ${additionalInfo}`;
        case NOTIFICATIONS.SAVED:
            return `Content saved: ${additionalInfo}`;
        case NOTIFICATIONS.COMMENT:
            return `New comment on your post: ${additionalInfo}`;
        case NOTIFICATIONS.REMINDER:
            return `Reminder: ${additionalInfo}`;
        case NOTIFICATIONS.PAYMENT:
            return `Payment received: ${additionalInfo}`;
        default:
            return `Unknown notification type: ${type}`;
    }
}


async function createNotification(type, additionalInfo, targetUser = null, issuedBy = 'system',) {
    try {

        const message = createNotificationMessage(type, additionalInfo)

        const notification = new Notification({ type, message, issuedBy, targetUser });
        await notification.save();
        return notification;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to create notification');
    }
}

module.exports = { NOTIFICATIONS, createNotificationMessage, createNotification }