const router = require('express').Router();
const UoeTask = require('../models/uoe_task');
const getRandomDocuments = require('../utils/getRandomDocuments');

const checkTaskAnswer = async (model, taskID, answer) => {
    const task = await model.findOne({_id: taskID}).exec();
    return task.answer === answer;
};

router.get('/training/use-of-english', async (req, res) => {
    const DEFAULT_BATCH_SIZE = 10;

    const topic = req.query.topic;
    const batchSize = req.query.size || DEFAULT_BATCH_SIZE;
    const filterOptions = {};
    if (topic) {
        filterOptions.topic = topic;
    }
    const questions = await getRandomDocuments(UoeTask, batchSize, filterOptions);
    questions.map((question) => delete question.answer);

    res.status(200).send({
        message: 'success',
        questions
    });
});

router.post('/training/use-of-english/check', async (req, res) => {
    const userAnswers = req.body;
    const correctness = userAnswers.map((userAnswer) => {
        return {
            _id: userAnswer._id,
            ifCorrect: checkTaskAnswer(UoeTask, userAnswer._id, userAnswer.answer)
        };
    });

    res.status(200).send({
        message: 'success',
        correctness
    });
});

module.exports = router;
