const express = require("express");
const path = require("path");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const responseJson = require("../../../../utils/responseJson");
const { makeMoved } = require("../../../../utils/fileUpload");

const AcademicSchool = require("../../../../models/StudentSchoolAcademic")
const AcademicCreative = require("../../../../models/StudentCreativePortfolioAcademic")
const AcademicResearch = require("../../../../models/StudentResearchAcademic")


const createSchoolAcademicValidationChain = [
    body('label').notEmpty().trim().withMessage('label is required field.'),
    body('gpa_weighting').notEmpty().trim().withMessage('gpa weighting is required field.'),
    body('class_size').notEmpty().trim().withMessage('class size is required field.'),
    body('target_class_rank').notEmpty().trim().withMessage('target class rank is required field.'),
    body('actual_class_rank').notEmpty().trim().withMessage('actual class rank is required field.'),
    body('gpa_scale').notEmpty().trim().withMessage('gpa scale is required field.'),
    body('target_gpa').notEmpty().trim().withMessage('target gpa is required field.'),
    body('actual_gpa').notEmpty().trim().withMessage('actual gpa is required field.'),
    body('target_cumulative_gpa').notEmpty().trim().withMessage('target cumulative gpa is required field.'),
    body('cumulative_gpa').notEmpty().trim().withMessage('cumulative gpa is required field.'),
];

const createSchoolResearchValidationChain = [
    body('research_field').notEmpty().trim().withMessage('research field is required field.'),
    body('sub_field').notEmpty().trim().withMessage('sub field is required field.'),
    body('advisor').notEmpty().trim().withMessage('advisor is required field.'),
    body('advisor_affiliation_university').notEmpty().trim().withMessage('advisor affiliation university is required field.'),
    body('pursuing_publication').notEmpty().trim().withMessage('pursuing publication is required field.'),
    body('start_date').notEmpty().trim().withMessage('start date is required field.'),
    body('end_date').notEmpty().trim().withMessage('end date is required field.'),
    body('research_question').notEmpty().trim().withMessage('research question is required field.'),
];

const createSchoolCreativeValidationChain = [
    body('portfolio_name').notEmpty().trim().withMessage('portfolio name is required field.'),
    body('category').notEmpty().trim().withMessage('category is required field.'),
    body('program_provider').notEmpty().trim().withMessage('program provider is required field.'),
    body('start_date').notEmpty().trim().withMessage('start date is required field.'),
    body('end_date').notEmpty().trim().withMessage('end date is required field.')
];

//  all academics 
router.get("/", async (req, res) => {

    const id = req.user._id;

    const academicSchool = await AcademicSchool.find({ student_id: id }).sort({ _id: -1 }).lean();
    const academicCreative = await AcademicCreative.find({ student_id: id }).sort({ _id: -1 }).lean();
    const academicResearch = await AcademicResearch.find({ student_id: id }).sort({ _id: -1 }).lean();

    const response = responseJson(true, { academicSchool, academicCreative, academicResearch }, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

// school academics 
router.get("/academic-school", async (req, res) => {
    const id = req.user._id;
    const academicSchool = await AcademicSchool.find({ student_id: id }).sort({ createdAt: -1 });
    const response = responseJson(true, academicSchool, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


router.post("/academic-school",createSchoolAcademicValidationChain, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const id = req.user._id;

    if (req.files.transcript) {
        req.body.transcript = makeMoved(req.files.transcript);
    }

    const academicSchool = await AcademicSchool.create({ student_id: id, ...req.body });
    const response = responseJson(true, academicSchool, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/academic-school/:id", async (req, res) => {
    const { id } = req.params;

    const academicSchool = await AcademicSchool.findOne({ _id: id });

    if (!academicSchool) {
        throw new Error('You are trying to update non-existing document.');
    }

    if (req.files.transcript) {
        req.body.transcript = makeMoved(req.files.transcript);
    }
    await academicSchool.updateOne({ ...req.body });

    const response = responseJson(true, {}, 'Academic document updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/academic-school/:id", async (req, res) => {
    const { id } = req.params;

    const academicSchool = await AcademicSchool.findOne({ _id: id });

    if (!academicSchool) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await academicSchool.deleteOne();
    const response = responseJson(true, academicSchool, 'Academic document deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});
// school academics 



// Academic Research & Publications 
router.get("/academic-research", async (req, res) => {
    const id = req.user._id;
    const academicResearch = await AcademicResearch.find({ student_id: id }).sort({ _id: -1 });
    const response = responseJson(true, academicResearch, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post("/academic-research", createSchoolResearchValidationChain, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const id = req.user._id;

    if (req.files.research_paper) {
        req.body.research_paper = makeMoved(req.files.research_paper);
    }

    const academicResearch = await AcademicResearch.create({ student_id: id, ...req.body });
    const response = responseJson(true, academicResearch, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/academic-research/:id", async (req, res) => {
    const { id } = req.params;

    const academicResearch = await AcademicResearch.findOne({ _id: id });

    if (!academicResearch) {
        throw new Error('You are trying to update non-existing document.');
    }

    if (req.files.research_paper) {
        req.body.research_paper = makeMoved(req.files.research_paper);
    }

    await academicResearch.updateOne({ ...req.body });

    const response = responseJson(true, {}, 'Academic document updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/academic-research/:id", async (req, res) => {
    const { id } = req.params;

    const academicResearch = await AcademicResearch.findOne({ _id: id });

    if (!academicResearch) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await academicResearch.deleteOne();
    const response = responseJson(true, academicResearch, 'Academic document deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



// Creative Portfolios 
router.get("/academic-creative", async (req, res) => {
    const id = req.user._id;
    
    const academicCreative = await AcademicCreative.find({ student_id: id }).sort({ _id: -1 });
    const response = responseJson(true, academicCreative, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post("/academic-creative", createSchoolCreativeValidationChain, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }

    const id = req.user._id;

    if (req.files.doc) {
        req.body.doc = makeMoved(req.files.doc);
    }

    const academicCreative = await AcademicCreative.create({ student_id: id, ...req.body });
    const response = responseJson(true, academicCreative, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/academic-creative/:id", async (req, res) => {
    const { id } = req.params;

    const academicCreative = await AcademicCreative.findOne({ _id: id });

    if (!academicCreative) {
        throw new Error('You are trying to update non-existing document.');
    }

    if (req.files.doc) {
        req.body.doc = makeMoved(req.files.doc);
    }

    await academicCreative.updateOne({ ...req.body });

    const response = responseJson(true, {}, 'Academic document updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/academic-creative/:id", async (req, res) => {
    const { id } = req.params;

    const academicCreative = await AcademicCreative.findOne({ _id: id });

    if (!academicCreative) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await academicCreative.deleteOne();
    const response = responseJson(true, academicCreative, 'Academic document deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

module.exports = router;