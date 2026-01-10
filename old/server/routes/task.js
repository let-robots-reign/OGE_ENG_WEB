const router = require('express').Router();
const taskController = require('../controllers/task');

require('dotenv').config();


router.get('/training/use-of-english', async (req, res) => {
    const DEFAULT_BATCH_SIZE = 10;
    const topic = req.query.topic.replace('   ', ' + ');
    const batchSize = req.query.size || DEFAULT_BATCH_SIZE;
    const questions = await taskController.getUoeTask(topic, batchSize);

    res.status(200).send({
        message: 'success',
        questions
    });
});

router.get('/training/reading', async (req, res) => {
    try {
        const question = await taskController.getReadingTask(req.query.topic);
        res.status(200).send({
            message: 'success',
            question
        });
    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
});

router.get('/training/audio', async (req, res) => {
    try {
        const question = await taskController.getAudioTask(req.query.topic);
        res.status(200).send({
            message: 'success',
            question
        });
    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
});

router.get('/training/writing', async (req, res) => {
    const task = await taskController.getWritingTask();
    res.status(200).send({
        message: 'success',
        task
    });
});

router.post('/training/use-of-english/check', async (req, res) => {
    const { user_id, answers } = req.body;
    res.status(200).send({
        message: 'success',
        ...(await taskController.checkUoeTask(user_id, answers))
    });
});

router.post('/training/reading/check', async (req, res) => {
    const {_id, user_id, answers} = req.body;

    res.status(200).send({
        message: 'success',
        ...(await taskController.checkReadingTask(_id, user_id, answers))
    });
});

router.post('/training/audio/check', async (req, res) => {
    const {_id, user_id, answers} = req.body;

    res.status(200).send({
        message: 'success',
        ...(await taskController.checkAudioTask(_id, user_id, answers))
    });
});

router.post('/training/writing/check', async (req, res) => {
    const { user_id, answers } = req.body;
    const { letterPartsAnswers, clichesAnswers, linkersAnswers, fullRepliesAnswers } = answers;

    res.status(200).send({
        message: 'success',
        ...(await taskController.checkWritingTask(user_id, letterPartsAnswers, clichesAnswers,
            linkersAnswers, fullRepliesAnswers))
    });
});

module.exports = router;
