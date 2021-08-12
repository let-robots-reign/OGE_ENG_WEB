const router = require('express').Router();
const UoeTask = require('../models/uoe_task');
const getRandomDocuments = require('../utils/getRandomDocuments');

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
    const sortById = (lhs, rhs) => parseInt(lhs._id) > parseInt(rhs._id) && 1 || -1;

    userAnswers.sort(sortById);

    const documents = await UoeTask.find({_id: {$in: userAnswers.map((item) => item._id)}});
    documents.sort(sortById);

    const correctness = userAnswers.map((userAnswer, index) => {
        return {
            _id: userAnswer._id,
            rightAnswer: documents[index].answer
        };
    });

    res.status(200).send({
        message: 'success',
        correctness
    });
});

module.exports = router;
