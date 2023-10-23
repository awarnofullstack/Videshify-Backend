const express = require("express");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const responseJson = require("../../../../utils/responseJson");

const StudentCurricularActivity = require("../../../../models/StudentExtraCurricularActivity")
const StudentWorkExperienceActivity = require("../../../../models/StudentWorkExperienceActivity")


const createCurricularActivityValidationChain = [
    body('activity_title').notEmpty().trim().withMessage('activity title is required field.'),
    body('category').notEmpty().trim().withMessage('category is required field.'),
    body('start_date').notEmpty().trim().withMessage('start date is required field.'),
    body('end_date').notEmpty().trim().withMessage('end date is required field.'),
    body('organization_name').notEmpty().trim().withMessage('organization name is required field.'),
    body('time_of_participation').notEmpty().trim().withMessage('time of participation is required field.'),
    body('position_leadership').notEmpty().trim().withMessage('position leadership is required field.'),
    body('school_year').notEmpty().trim().withMessage('school year is required field.'),
    body('weeks_per_year').notEmpty().trim().withMessage('weeks per_year is required field.'),
    body('hours_per_week').notEmpty().trim().withMessage('hours per week is required field.'),
    body('description').notEmpty().trim().withMessage('description is required field.'),
];

const createWorkExperienceActivityValidationChain = [
    body('internship_title').notEmpty().trim().withMessage('internship title is required field.'),
    body('industry').notEmpty().trim().withMessage('industry is required field.'),
    body('organization_name').notEmpty().trim().withMessage('organization name is required field.'),
    body('start_date').notEmpty().trim().withMessage('start date is required field.'),
    body('end_date').notEmpty().trim().withMessage('end date is required field.'),
    body('program_provider').notEmpty().trim().withMessage('program provider is required field.'),
    body('application_deadline').notEmpty().trim().withMessage('application deadline is required field.'),
    body('position_title').notEmpty().trim().withMessage('position title is required field.'),
];

// All Activity 
router.get("/all", async (req, res) => {
    const id = req.user._id;

    const curricularActivity = await StudentCurricularActivity.find({ student_id: id }).sort({ _id: -1 }).lean();
    const workExperienceActivity = await StudentWorkExperienceActivity.find({ student_id: id }).sort({ _id: -1 }).lean();

    const response = responseJson(true, { curricularActivity, workExperienceActivity }, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

// Student Extra Curricular Activity
router.get("/extra-curricular-activity", async (req, res) => {
    const id = req.user._id;
    const curricularActivity = await StudentCurricularActivity.find({ student_id: id }).sort({ _id: -1 }).lean();
    const response = responseJson(true, curricularActivity, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.get("/extra-curricular-activity/:id", async (req, res) => {
    const { id } = req.params;
    const curricularActivity = await StudentCurricularActivity.findOne({ _id: id }).lean();

    if (!curricularActivity) {
        throw new Error("Invalid document id, no record found.")
    }
    const response = responseJson(true, curricularActivity, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post("/extra-curricular-activity", createCurricularActivityValidationChain, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const id = req.user._id;

    const curricularActivity = await StudentCurricularActivity.create({ student_id: id, ...req.body });
    const response = responseJson(true, curricularActivity, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/extra-curricular-activity/:id", async (req, res) => {
    const { id } = req.params;

    const curricularActivity = await StudentCurricularActivity.findOne({ _id: id });

    if (!curricularActivity) {
        throw new Error('You are trying to update non-existing document.');
    }

    await curricularActivity.updateOne({ ...req.body });

    const response = responseJson(true, {}, 'Activity document updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/extra-curricular-activity/:id", async (req, res) => {
    const { id } = req.params;

    const curricularActivity = await StudentCurricularActivity.findOne({ _id: id });

    if (!curricularActivity) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await curricularActivity.deleteOne();
    const response = responseJson(true, curricularActivity, 'Activity document deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



// Student Work Experience Activity
router.get("/work-experience-activity", async (req, res) => {
    const id = req.user._id;
    const workExperienceActivity = await StudentWorkExperienceActivity.find({ student_id: id }).sort({ _id: -1 }).lean();
    const response = responseJson(true, workExperienceActivity, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.get("/work-experience-activity/:id", async (req, res) => {
    const id = req.user._id;
    const workExperienceActivity = await StudentWorkExperienceActivity.find({ student_id: id }).sort({ _id: -1 }).lean();

    if (!workExperienceActivity) {
        throw new Error('You are trying to delete non-existing document.');
    }

    const response = responseJson(true, workExperienceActivity, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post("/work-experience-activity", createWorkExperienceActivityValidationChain, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const id = req.user._id;

    const workExperienceActivity = await StudentWorkExperienceActivity.create({ student_id: id, ...req.body });
    const response = responseJson(true, workExperienceActivity, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/work-experience-activity/:id", async (req, res) => {
    const { id } = req.params;

    const workExperienceActivity = await StudentWorkExperienceActivity.findOne({ _id: id });

    if (!workExperienceActivity) {
        throw new Error('You are trying to update non-existing document.');
    }

    await workExperienceActivity.updateOne({ ...req.body });

    const response = responseJson(true, {}, 'Work Experience document updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/work-experience-activity/:id", async (req, res) => {
    const { id } = req.params;

    const workExperienceActivity = await StudentWorkExperienceActivity.findOne({ _id: id });

    if (!workExperienceActivity) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await workExperienceActivity.deleteOne();
    const response = responseJson(true, workExperienceActivity, 'Work Experience document deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

module.exports = router;