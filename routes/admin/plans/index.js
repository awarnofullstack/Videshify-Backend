const express = require("express");
const router = express.Router();

const User = require("../../../models/User");
const StudentCounselor = require("../../../models/StudentCounselor");
const StudentInCounselor = require("../../../models/StudentInCounselor");
const Student = require("../../../models/Student");
const responseJson = require("../../../utils/responseJson");
const Schedule = require("../../../models/Schedule");
const PlanBilling = require("../../../models/PlanBilling");
const ActivePlanBilling = require("../../../models/ActivePlanBilling");



router.get('/', async (req, res) => {
    const planBillings = await PlanBilling.find();

    const response = responseJson(true, planBillings, '', 200);
    return res.status(200).json(response)
})

router.get("/:id/edit", async (req, res) => {
    const { id } = req.params;

    const findPlan = await PlanBilling.findById(id);

    if (!findPlan) {
        throw new Error('No plan exist with request ID')
    }

    const response = responseJson(true, findPlan, '', 200, []);
    return res.status(200).json(response);
});

router.post("/", async (req, res) => {

    const { price, type, label, uptomembers } = req.body;

    const findPlan = await PlanBilling.findOne({ type });

    if (findPlan) {
        throw new Error(`${type} type plan is added already.`)
    }

    const createPlan = await PlanBilling.create(req.body);

    const response = responseJson(true, createPlan, 'Plan added', 201, []);
    return res.status(200).json(response);
});

router.put("/:id/edit", async (req, res) => {
    const { id } = req.params;


    const findPlan = await PlanBilling.findById(id);

    if (!findPlan) {
        throw new Error('No plan exist with request ID')
    }

    const editPlan = await PlanBilling.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    const response = responseJson(true, editPlan, 'Plan updated', 200, []);
    return res.status(200).json(response);
});

router.get("/billings", async (req, res) => {

    const planBillings = await ActivePlanBilling.find().sort({ _id: -1 }).populate([{path:'counselor',select: 'first_name last_name role _id'},{path:'plan',select: 'label type price'}]);

    const response = responseJson(true, planBillings, '', 200, []);
    return res.status(200).json(response);
});


module.exports = router;