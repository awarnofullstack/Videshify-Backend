const express = require("express");
const path = require("path");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const router = express.Router();

const responseJson = require("../../../../utils/responseJson");
const { makeMoved } = require("../../../../utils/fileUpload");

const StudentTesting = require("../../../../models/StudentTesting");


const createStudentTestingValidationChain = [
    body('test_type').notEmpty().trim().withMessage('test type is required field.'),
    body('name').notEmpty().trim().withMessage('name is required field.'),
    body('total_marks').notEmpty().trim().withMessage('total mark is required field.'),
    body('target_marks').notEmpty().trim().withMessage('target marks is required field.'),
    body('start_date').notEmpty().trim().withMessage('start date is required field.'),
    body('test_date').notEmpty().trim().withMessage('test date is required field.'),
    body('end_date').notEmpty().trim().withMessage('end date is required field.'),
];

const ObjectID = mongoose.Types.ObjectId;

router.get("/", async (req, res) => {
    const id = req.user._id;
    const studentTesting = await StudentTesting.find({ student_id: id }).sort({ createdAt: -1 });
    const response = responseJson(true, studentTesting, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const studentTesting = await StudentTesting.findOne({ _id: id }).populate("members");

    if (!studentTesting) {
        throw new Error('Incorrect test document id.')
    }
    const response = responseJson(true, studentTesting, '', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.post("/", createStudentTestingValidationChain, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const response = responseJson(false, null, `${ReasonPhrases.UNPROCESSABLE_ENTITY} ${errors.array()[0].msg}`, StatusCodes.UNPROCESSABLE_ENTITY, errors.array());
        return res.status(StatusCodes.OK).json(response);
    }
    const id = req.user._id;

    const studentTesting = await StudentTesting.create({ student_id: id, ...req.body });
    const response = responseJson(true, studentTesting, 'A new test added.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;

    const studentTesting = await StudentTesting.findOne({ _id: id });

    if (!studentTesting) {
        throw new Error('You are trying to update non-existing document.');
    }

    await studentTesting.updateOne({ ...req.body });

    const response = responseJson(true, {}, 'Testing document updated successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const studentTesting = await StudentTesting.findOne({ _id: id });

    if (!studentTesting) {
        throw new Error('You are trying to delete non-existing document.');
    }

    await studentTesting.deleteOne();
    const response = responseJson(true, null, 'Testing document deleted successfuly.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});



// TASKs 
router.post("/:id/task", async (req, res) => {

    const id = req.params;
    const studentTesting = await StudentTesting.findOne({ _id: new ObjectID(id) });

    if (!studentTesting) {
        throw new Error('You are trying to update non-existing document.');
    }

    const newTask = {
        _id: new ObjectID(),
        label: req.body.label,
        due_date: req.body.due_date,
    };

    const added = await StudentTesting.findByIdAndUpdate(new ObjectID(id),
        { $push: { task: newTask } },
        { new: true }
    );

    const response = responseJson(true, added, 'New task added.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.put("/:id/task/:taskId", async (req, res) => {
    const { id, taskId } = req.params;

    const studentTask = await StudentTesting.findOne({ _id: new ObjectID(id), 'task._id': new ObjectID(taskId) });

    if (!studentTask) {
        throw new Error('You are trying to update non-existing document.');
    }

    const taskToUpdate = studentTask.task.id(taskId);
    if (taskToUpdate) {
        const { label, due_date, status } = req.body;
        taskToUpdate.label = label;
        taskToUpdate.due_date = due_date;
        taskToUpdate.status = status;
    }

    const updatedTask = await studentTask.save();

    const response = responseJson(true, updatedTask.task, 'Task updated as per request.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});

router.delete("/:id/task/:taskId", async (req, res) => {
    const { id, taskId } = req.params;

    const studentTask = await StudentTesting.findOne({ _id: new ObjectID(id), 'task._id': new ObjectID(taskId) });

    if (!studentTask) {
        throw new Error('You are trying to update non-existing document.');
    }

    await studentTask.updateOne({
        $pull: { task: { _id: taskId } }
    })

    const response = responseJson(true, null, 'Task deleted as per request.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


// MEMBERS 
router.patch("/:id/assign", async (req, res) => {
    const id = req.user._id;

    const studentTesting = await StudentTesting.findOne({ _id: id });

    if (!studentTesting) {
        throw new Error('You are trying to update non-existing document.');
    }

    await studentTesting.updateOne({ ...req.body });
    const response = responseJson(true, studentTesting, 'Member assigned to test.', StatusCodes.OK, []);
    return res.status(StatusCodes.OK).json(response);
});


module.exports = router;