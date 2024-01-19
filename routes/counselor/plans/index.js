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
    // const plans = await PlanBilling.find();

    const aggregatePipeline = [
        {
            $lookup: {
                from: 'activeplanbillings',
                localField: '_id',
                foreignField: 'plan',
                as: 'activePlan'
            }
        },
        {
            $addFields: {
                isActive: {
                    $cond: {
                        if: {
                            $gt: [
                                { $size: "$activePlan" },
                                0
                            ]
                        },
                        then: {
                            $anyElementTrue: {
                                $map: {
                                    input: "$activePlan",
                                    as: "ap",
                                    in: { $eq: ["$$ap.isExpired", false] }
                                }
                            }
                        },
                        else: false
                    }
                }
            }
        },
        {
            $project: { activePlan : 0}
        }
    ];

    const plans = await PlanBilling.aggregate(aggregatePipeline)

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
        // populate: [{ path: 'paymentRef' }, { path: 'plan' }]
    }

    const query = { counselor: new ObjectId(req.user._id) }


    const orConditions = [];

    if (search) {
        orConditions.push(
            { "paymentRef.reference_no": { $regex: new RegExp(search, 'i') } },
            { "plan.label": { $regex: new RegExp(search, 'i') } },
            { "plan.type": { $regex: new RegExp(search, 'i') } },
        );
    }

    if (orConditions.length > 0) {
        query.$or = orConditions;
    }

    const planAggregate = ActivePlanBilling.aggregate([
        {
            $lookup: {
                from: 'payments',
                localField: 'paymentRef',
                foreignField: '_id',
                as: 'paymentRef',
                pipeline: [
                    {
                        $project: { amount: 1, type: 1, service: 1, reference_no: 1, note: 1, _id: 1 }
                    }
                ]
            }
        },
        {
            $unwind: '$paymentRef'
        },
        {
            $lookup: {
                from: 'planbillings',
                localField: 'plan',
                foreignField: '_id',
                as: 'plan'
            }
        },
        {
            $unwind: '$plan'
        },
        {
            $addFields: {
                startDate: {
                    $toDate: "$createdAt" // Convert createdAt to BSON date
                }
            }
        },
        {
            $addFields: {
                expiryDate: {
                    $dateToString: {
                        date: { $add: ["$startDate", { $multiply: [1, 30 * 24 * 60 * 60 * 1000] }] }, // Add 30 days to startDate
                        format: "%d/%m/%Y"
                    }
                }
            }
        },
        {
            $match: query
        }
    ])

    const plans = await ActivePlanBilling.aggregatePaginate(planAggregate, options);
    const response = responseJson(true, plans, '', 200);
    return res.status(200).json(response);
});

router.post("/checkout", async (req, res) => {

    const { plan, paymentRef, ref_id } = req.body;

    const haveActivePlan = await ActivePlanBilling.findOne({ isExpired: false, counselor: new ObjectId(req.user._id) });

    if (haveActivePlan) {
        await haveActivePlan.updateMany({ isExpired: true })
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