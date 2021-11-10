const router = require('express').Router();
const UoeTask = require('../models/uoe_task');
const AudioTaskFirst = require('../models/audio_task_first');
const ReadingTaskFirst = require('../models/reading_task_first');
const WritingTask = require('../models/writing_task');
const {getRandomDocument, getRandomDocuments} = require('../utils/getRandomDocuments');
const shuffle = require('../utils/shuffle');

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

    // question.audioPath = `${process.env.BACKEND_URL}/audio/${audio}.m4a`;
    question.audioPath = `https://oge-eng.ru/files/audio/${audio}.m4a`;

    res.status(200).send({
        message: 'success',
        question
    });
});

router.get('/training/writing', async (req, res) => {
    const allTasks = await WritingTask.find({});

    const getSubtasksByTopic = (topic, withOptions=false) => {
        let tasks = allTasks.filter((task) => task.topic === topic).map((task) => task._doc);
        if (withOptions) {
            tasks = tasks.map((task) => {
                task.options = [...task.answer.split((task.answer.includes('\r\n')) ? '\r\n' : ' ')];
                shuffle(task.options);
                return task;
            });
        }
        // eslint-disable-next-line no-unused-vars
        return tasks.map(({ answer, ...task }) => task);
    };

    const task = {
        structure: getSubtasksByTopic('structure'),
        cliches: getSubtasksByTopic('cliche', true),
        linkers: getSubtasksByTopic('linkers', true),
        fullAnswers: getSubtasksByTopic('full_answers')
    };

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

router.post('/training/writing/check', async (req, res) => {
    const { letterPartsAnswers, clichesAnswers, linkersAnswers, fullRepliesAnswers } = req.body;
    const allTasks = await WritingTask.find({});

    const getAnswersByTopic = (topic) => allTasks.filter((task) => task.topic === topic).map((task) => task.answer);

    const letterPartsRightAnswers = getAnswersByTopic('structure').map((answer) => answer.split('\r\n'))[0];
    const letterPartsCorrectness = letterPartsAnswers.map((letterAnswer, index) =>
        letterAnswer === letterPartsRightAnswers[index]);
    const clichesRightAnswers = getAnswersByTopic('cliche').map((answer) => answer.split(' '));
    const clichesCorrectness = clichesAnswers.map((cliche, i) =>
        cliche.map((answer, j) => answer === clichesRightAnswers[i][j]));
    const linkersRightAnswers = getAnswersByTopic('linkers').map((answer) => answer.split('\r\n'));
    const linkersCorrectness = linkersAnswers.map((linker, i) =>
        linker.map((answer, j) => answer === linkersRightAnswers[i][j]));
    const fullRepliesRightAnswers = getAnswersByTopic('full_answers');
    const fullRepliesCorrectness = fullRepliesAnswers.map((reply, index) =>
        reply === parseInt(fullRepliesRightAnswers[index]));

    const result = [letterPartsCorrectness, clichesCorrectness, linkersCorrectness, fullRepliesCorrectness]
        .flat(2).filter(Boolean).length;

    res.status(200).send({
        message: 'success',
        letterPartsCorrectness,
        clichesCorrectness,
        linkersCorrectness,
        fullRepliesCorrectness,
        result
    });
});

module.exports = router;
