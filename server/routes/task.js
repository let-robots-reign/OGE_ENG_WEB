const router = require('express').Router();
const UoeTask = require('../models/uoe_task');

const getRandomDocument = async (model, filterOptions) => {
    return await model.aggregate([
        { $match: filterOptions },
        { $sample: { size: 1 } }
    ]);
};

const getRandomDocuments = async (model, n, filterOptions) => {
    const count = await model.countDocuments().exec();
    if (count < n) {
        n = count;
    }

    const documents = [];
    const ids = [];
    let document = {};
    let id = 0;
    for (let i = 0; i < n; ++i) {
        document = await getRandomDocument(model, filterOptions);
        while (ids.includes(document.id)) {
            document = await getRandomDocument(model, filterOptions);
        }
        documents.push(document);
        ids.push(id);
    }
    return documents;
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
    questions.map((question) => delete question[0].answer);

    res.status(200).send({
        message: 'success',
        questions
    });
});

module.exports = router;
