const router = require('express').Router();
const UoeTask = require('../models/uoe_task');
const ReadingTaskFirst = require('../models/reading_task_first');
const {getRandomDocument, getRandomDocuments} = require('../utils/getRandomDocuments');

router.get('/training/use-of-english', async (req, res) => {
    const DEFAULT_BATCH_SIZE = 10;
    const DEFAULT_TOPIC = 'По всем темам';

    const topic = req.query.topic.replace('   ', ' + ');
    const batchSize = req.query.size || DEFAULT_BATCH_SIZE;
    const filterOptions = {};
    if (topic && topic !== DEFAULT_TOPIC) {
        filterOptions.topic = topic;
    }
    const questions = await getRandomDocuments(UoeTask, batchSize, filterOptions);
    questions.map((question) => delete question.answer);

    res.status(200).send({
        message: 'success',
        questions
    });
});

router.get('/training/reading', async (req, res) => {
    const topic = req.query.topic;
    let model;
    if (topic === 'Задание 9') {
        model = ReadingTaskFirst;
    }
    const question = await getRandomDocument(model);
    delete question.answer;
    delete question.explanation;

    res.status(200).send({
        message: 'success',
        question
    });
});

router.post('/training/use-of-english/check', async (req, res) => {
    const userAnswers = req.body;
    const sortById = (lhs, rhs) => parseInt(lhs._id) > parseInt(rhs._id) && 1 || -1;

    userAnswers.sort(sortById);

    const documents = await UoeTask.find({_id: {$in: userAnswers.map((item) => item._id)}});
    documents.sort(sortById);

    let rightAnswers = 0;
    const correctness = userAnswers.map((userAnswer, index) => {
        const rightAnswer = documents[index].answer;
        rightAnswers += userAnswer.answer === rightAnswer;
        return {
            _id: userAnswer._id,
            rightAnswer
        };
    });

    res.status(200).send({
        message: 'success',
        correctness,
        rightAnswers
    });
});

router.post('/training/reading/check', async (req, res) => {
    const {_id, answers} = req.body;
    const task = await ReadingTaskFirst.findOne({_id});
    const rightAnswers = task.answer.split(' ').map((ans) => parseInt(ans));
    const correctness = answers.map((answer, index) => answer === rightAnswers[index]);

    res.status(200).send({
        message: 'success',
        correctness,
        rightAnswers
    });
});

module.exports = router;
