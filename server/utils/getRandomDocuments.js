const getRandomDocument = async (model, filterOptions) => {
    return (await model.aggregate([
        {$match: filterOptions},
        {$sample: {size: 1}}
    ]))[0];
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

module.exports = getRandomDocuments;
