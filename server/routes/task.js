const router = require('express').Router();
const UoeTask = require('../models/uoe_task');
const AudioTaskFirst = require('../models/audio_task_first');
const ReadingTaskFirst = require('../models/reading_task_first');
const WritingTask = require('../models/writing_task');
const {getRandomDocument, getRandomDocuments} = require('../utils/getRandomDocuments');

require('dotenv').config();

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
    switch (topic) {
    case 'Задание 9':
        model = ReadingTaskFirst;
        break;
    default:
        res.status(500).send({
            message: 'unknown topic'
        });
    }

    // eslint-disable-next-line no-unused-vars
    const {answer, explanation, ...question} = await getRandomDocument(model);

    res.status(200).send({
        message: 'success',
        question
    });
});

router.get('/training/audio', async (req, res) => {
    const topic = req.query.topic;
    let model;
    switch (topic) {
    case 'Задание 1':
        model = AudioTaskFirst;
        break;
    default:
        res.status(500).send({
            message: 'unknown topic'
        });
    }

    // eslint-disable-next-line no-unused-vars
    const {answer, explanation, audio, ...question} = await getRandomDocument(model);

    question.audioPath = `${process.env.BACKEND_URL}/audio/${audio}.m4a`;

    res.status(200).send({
        message: 'success',
        question
    });
});

router.get('/training/writing', async (req, res) => {
    const allTasks = await WritingTask.find({});
    const getSubtasksByTopic = (topic) => allTasks.filter(task => task.topic === topic);
    const task = {
        structure: getSubtasksByTopic('structure'),
        cliches: getSubtasksByTopic('cliche'),
        linkers: getSubtasksByTopic('linkers'),
        fullAnswers: getSubtasksByTopic('full_answers')
    };

    // TODO: delete answers
    // TODO: for writing task linkers replace 'answers' with 'options'

    res.status(200).send({
        message: 'success',
        task
    });
});

router.post('/training/use-of-english/check', async (req, res) => {
    const userAnswers = req.body;
    const sortById = (lhs, rhs) => parseInt(lhs._id) > parseInt(rhs._id) && 1 || -1;

    userAnswers.sort(sortById);

    const documents = await UoeTask.find({_id: {$in: userAnswers.map((item) => item._id)}});
    documents.sort(sortById);

    let result = 0;
    const rightAnswers = documents.map((rightAnswer, index) => {
        const userAnswer = userAnswers[index].answer;
        result += userAnswer === rightAnswer.answer;
        return {
            _id: rightAnswer._id,
            rightAnswer: rightAnswer.answer
        };
    });

    res.status(200).send({
        message: 'success',
        rightAnswers,
        result
    });
});

router.post('/training/reading/check', async (req, res) => {
    const {_id, answers} = req.body;
    const task = await ReadingTaskFirst.findOne({_id});
    const rightAnswers = task.answer.split(' ').map((ans) => parseInt(ans));
    const correctness = answers.map((answer, index) => answer === rightAnswers[index]);
    const result = correctness.filter(Boolean).length;

    res.status(200).send({
        message: 'success',
        correctness,
        rightAnswers,
        result,
        explanation: task.explanation
    });
});

router.post('/training/audio/check', async (req, res) => {
    const {_id, answers} = req.body;
    const task = await AudioTaskFirst.findOne({_id});
    const rightAnswers = task.answer.split(' ').map((ans) => parseInt(ans));
    const correctness = answers.map((answer, index) => parseInt(answer) === rightAnswers[index]);
    const result = correctness.filter(Boolean).length;

    res.status(200).send({
        message: 'success',
        correctness,
        rightAnswers,
        result,
        explanation: task.explanation
    });
});

module.exports = router;
