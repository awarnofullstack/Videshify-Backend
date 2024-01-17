const cron = require('node-cron');
const moment = require("moment")
const ActivePlanBilling = require("../models/ActivePlanBilling")



const planExpireJon = () => {
    cron.schedule('0 0 * * *', async () => {
        // Run the job daily at midnight

        const expiredFromNow = moment().subtract(1, 'month');
        // Find active plans that haven't expired
        const activePlans = await ActivePlanBilling.find({ isExpired: false, createdAt: { $lte: expiredFromNow } }).update({ isExpired: true });
    });
}


module.exports = { planExpireJon };