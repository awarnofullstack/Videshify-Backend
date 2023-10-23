const express = require("express");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const responseJson = require("../../../../utils/responseJson");

const StudentResearchPrep = require("../../../../models/StudentResearchPrepCareer")
const StudentNetworking = require("../../../../models/StudentNetworkingCareer")
const StudentInterest = require("../../../../models/StudentInterestExploreCareer")


const createResearchPrepCareerValidationChain = [
    body('title').notEmpty().trim().toLowerCase().withMessage('title is required field.'),
    body('start_date').notEmpty().trim().withMessage('start date is required field.'),
    body('end_date').notEmpty().trim().withMessage('end date is required field.'),
    body('description').notEmpty().trim().withMessage('description is required field.'),
];

const createStudentNetworkingValidationChain = [
    body('title').notEmpty().trim().withMessage('title is required field.'),
    body('start_date').notEmpty().trim().withMessage('start date is required field.'),
    body('end_date').notEmpty().trim().withMessage('end date is required field.'),
    body('description').notEmpty().trim().withMessage('description is required field.'),
];

const createStudentInterestValidationChain = [
    body('title').notEmpty().trim().withMessage('title is required field.'),
    body('start_date').notEmpty().trim().withMessage('start date is required field.'),
    body('end_date').notEmpty().trim().withMessage('end date is required field.'),
    body('description').notEmpty().trim().withMessage('description is required field.'),
];

// All Activity 
router.get("/all", async (req, res) => {
    const id = req.user._id;

    const studentResearchPrep = await StudentResearchPrep.find({ student_id: id }).sort({ _id: -1 }).lean();
    const studentNetworking = await StudentNetworking.find({ student_id: id }).sort({ _id: -1 }).lean();
    const studentInterest = await StudentInterest.find({ student_id: id }).sort({ _id: -1 }).lean();

    const response = responseJson(true, { studentResearchPrep, studentNetworking, studentInterest }, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

// Student Research & Prep
router.get("/school-research-prep", async (req, res) => {
    const id = req.user._id;
    const studentResearchPrep = await StudentResearchPrep.find({ student_id: id }).sort({ _id: -1 }).lean();
    const response = responseJson(true, studentResearchPrep, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.get("/school-research-prep/:id", async (req, res) => {
    const { id } = req.params;
    const studentResearchPrep = await StudentResearchPrep.findOne({ _id: id }).lean();

    if (!studentResearchPrep) {
        throw new Error("Invalid document id, no record found.")
    }
    const response = responseJson(true, studentResearchPrep, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post("/school-research-prep", createResearchPrepCareerValidationChain, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const id = req.user._id;

    const studentResearchPrep = await StudentResearchPrep.create({ student_id: id, ...req.body });
    const response = responseJson(true, studentResearchPrep, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/school-research-prep/:id", createResearchPrepCareerValidationChain, async (req, res) => {
    const { id } = req.params;

    const studentResearchPrep = await StudentResearchPrep.findOne({ _id: id });

    if (!studentResearchPrep) {
        throw new Error('You are trying to update non-existing document.');
    }

    const updatedDocument = await StudentResearchPrep.findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true });

    const response = responseJson(true, updatedDocument, 'Research document updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/school-research-prep/:id", async (req, res) => {
    const { id } = req.params;

    const studentResearchPrep = await StudentResearchPrep.findOne({ _id: id });

    if (!studentResearchPrep) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await studentResearchPrep.deleteOne();
    const response = responseJson(true, studentResearchPrep, 'Research Prep document deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



// Student Networking Career
router.get("/networking", async (req, res) => {
    const id = req.user._id;
    const studentNetworking = await StudentNetworking.find({ student_id: id }).sort({ _id: -1 }).lean();
    const response = responseJson(true, studentNetworking, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.get("/networking/:id", async (req, res) => {
    const { id } = req.params;
    const studentNetworking = await StudentNetworking.findOne({ _id: id }).lean();

    if (!studentNetworking) {
        throw new Error("Invalid document id, no record found.")
    }
    const response = responseJson(true, studentNetworking, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post("/networking", createStudentNetworkingValidationChain, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const id = req.user._id;

    const studentNetworking = await StudentNetworking.create({ student_id: id, ...req.body });
    const response = responseJson(true, studentNetworking, 'Networking document created successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/networking/:id", createStudentNetworkingValidationChain, async (req, res) => {
    const { id } = req.params;

    const studentNetworking = await StudentNetworking.findOne({ _id: id });

    if (!studentNetworking) {
        throw new Error('You are trying to update non-existing document.');
    }

    const updatedDocument = await StudentNetworking.findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true });

    const response = responseJson(true, updatedDocument, 'Networking document updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/networking/:id", async (req, res) => {
    const { id } = req.params;

    const studentNetworking = await StudentNetworking.findOne({ _id: id });

    if (!studentNetworking) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await studentNetworking.deleteOne();
    const response = responseJson(true, studentNetworking, 'Networking document deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



// Student Interest Explore
router.get("/career-interest-exploration", async (req, res) => {
    const id = req.user._id;
    const studstudentInterestentInterest = await StudentInterest.find({ student_id: id }).sort({ _id: -1 }).lean();
    const response = responseJson(true, studentInterest, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.get("/career-interest-exploration/:id", async (req, res) => {
    const { id } = req.params;
    const studentInterest = await StudentInterest.findOne({ _id: id }).lean();

    if (!studentInterest) {
        throw new Error("Invalid document id, no record found.")
    }
    const response = responseJson(true, studentInterest, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post("/career-interest-exploration", createStudentInterestValidationChain, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const id = req.user._id;

    const studentInterest = await StudentInterest.create({ student_id: id, ...req.body });
    const response = responseJson(true, studentInterest, 'Career Interest document created successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/career-interest-exploration/:id", createStudentInterestValidationChain, async (req, res) => {
    const { id } = req.params;

    const studentInterest = await StudentInterest.findOne({ _id: id });

    if (!studentInterest) {
        throw new Error('You are trying to update non-existing document.');
    }

    const updatedDocument = await StudentInterest.findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true });

    const response = responseJson(true, updatedDocument, 'Career Interest document updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/career-interest-exploration/:id", async (req, res) => {
    const { id } = req.params;

    const studentInterest = await StudentInterest.findOne({ _id: id });

    if (!studentInterest) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await studentInterest.deleteOne();
    const response = responseJson(true, studentInterest, 'Career Interest document deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

module.exports = router;