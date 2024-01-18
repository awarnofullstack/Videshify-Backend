const express = require("express");
const mongoose = require("mongoose")
const moment = require("moment")

const router = express.Router();
const responseJson = require("../../../utils/responseJson");

const PlanBilling = require("../../../models/PlanBilling");
const ActivePlanBilling = require("../../../models/ActivePlanBilling");
const Payment = require("../../../models/Payment");


const ObjectId = mongoose.Types.ObjectId;

router.get("/", async (req, res) => {

    const plans = await PlanBilling.find();
    const response = responseJson(true, plans, '', 200);
    return res.status(200).json(response);
});

router.get("/:id/show", async (req, res) => {
    const { id } = req.params;
    const plans = await PlanBilling.findById(id);
    const response = responseJson(true, plans, '', 200);
    return res.status(200).json(response);
});

router.get("/billings", async (req, res) => {

    const { limit, page, search } = req.query;

    const options = {
        limit: parseInt(limit || 10),
        page: parseInt(page || 1),
        sort: { _id: -1 },
        populate: [{ path: 'paymentRef' }, { path: 'plan' }]
    }

    const query = { counselor: new ObjectId(req.user._id) }

    const plans = await ActivePlanBilling.paginate(query, options);
    const response = responseJson(true, plans, '', 200);
    return res.status(200).json(response);
});

router.post("/checkout", async (req, res) => {

    const { plan, paymentRef, ref_id } = req.body;

    const haveActivePlan = await ActivePlanBilling.findOne({ isExpired: false, counselor: new ObjectId(req.user._id) });

    if (haveActivePlan) {
        await haveActivePlan.updateOne({ isExpired: true })
    }

    const planByID = await PlanBilling.findOne({ _id: new ObjectId(plan) }).lean();

    const paymentRefValidate = await Payment.findOne({ reference_no: ref_id });

    if (paymentRefValidate) {
        throw new Error('Payment Referrence id can\'t be same.');
    }

    const payment = await Payment.create({ user: req.user._id, amount: planByID.price, type: 'debit', service: 'plan purchase', reference_no: ref_id })

    const plans = await ActivePlanBilling.create({ counselor: req.user._id, plan, paymentRef: payment._id });

    if (plans) {
        await PlanBilling.findByIdAndUpdate(plan, { $set: { totalActivations: planByID.totalActivations + 1 } }, { new: true })
    }
    const response = responseJson(true, plans, 'Plan Activated', 200);
    return res.status(200).json(response);
});

module.exports = router;