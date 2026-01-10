const UoeTask = require('../models/uoe_task');
const AudioTaskFirst = require('../models/audio_task_first');
const ReadingTaskFirst = require('../models/reading_task_first');
const WritingTask = require('../models/writing_task');
const userController = require('./user');
const {getRandomDocument, getRandomDocuments} = require('../utils/getRandomDocuments');
const shuffle = require('../utils/shuffle');

const computeResult = (correct, total) => `${correct}/${total}`;
const computeExperience = () => 0;

class TaskController {
    async getAudioTask(topic) {
        let model;
        switch (topic) {
        case 'Задание 1':
            model = AudioTaskFirst;
            break;
        default:
            return new TypeError('unknown topic');
        }

        // eslint-disable-next-line no-unused-vars
        const {answer, explanation, audio, ...question} = await getRandomDocument(model);
        // question.audioPath = `${process.env.BACKEND_URL}/audio/${audio}.m4a`;
        question.audioPath = `https://oge-eng.ru/files/audio/${audio}.m4a`;
        return question;
    }

    async getReadingTask(topic) {
        let model;
        switch (topic) {
        case 'Задание 9':
            model = ReadingTaskFirst;
            break;
        default:
            return new TypeError('unknown topic');
        }

        // eslint-disable-next-line no-unused-vars
        const {answer, explanation, ...question} = await getRandomDocument(model);
        return question;
    }

    async getUoeTask(topic, batchSize) {
        const DEFAULT_TOPIC = 'По всем темам';
        const filterOptions = {};
        if (topic && topic !== DEFAULT_TOPIC) {
            filterOptions.topic = topic;
        }
        const questions = await getRandomDocuments(UoeTask, batchSize, filterOptions);
        questions.forEach((question) => delete question.answer);
        return questions;
    }

    async getWritingTask() {
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

        return {
            structure: getSubtasksByTopic('structure'),
            cliches: getSubtasksByTopic('cliche', true),
            linkers: getSubtasksByTopic('linkers', true),
            fullAnswers: getSubtasksByTopic('full_answers')
        };
    }

    async checkAudioTask(id, user_id, userAnswers) {
        const task = await AudioTaskFirst.findOne({_id: id});
        const rightAnswers = task.answer.split(' ').map((ans) => parseInt(ans));
        const correctness = userAnswers.map((answer, index) => parseInt(answer) === rightAnswers[index]);
        const result = correctness.filter(Boolean).length;
        if (user_id) {
            await userController.saveUserActivity({
                user_id,
                task: 'Задание 1',
                result: computeResult(result, rightAnswers.length),
                experience: computeExperience(),
                date: new Date(),
            });
        }
        return { rightAnswers, result, correctness, explanation: task.explanation };
    }

    async checkReadingTask(id, user_id, userAnswers) {
        const task = await ReadingTaskFirst.findOne({_id: id});
        const rightAnswers = task.answer.split(' ').map((ans) => parseInt(ans));
        const correctness = userAnswers.map((answer, index) => answer === rightAnswers[index]);
        const result = correctness.filter(Boolean).length;
        if (user_id) {
            await userController.saveUserActivity({
                user_id,
                task: 'Задание 9',
                result: computeResult(result, rightAnswers.length),
                experience: computeExperience(),
                date: new Date(),
            });
        }
        return { rightAnswers, result, correctness, explanation: task.explanation };
    }

    async checkUoeTask(user_id, userAnswers) {
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
        if (user_id) {
            await userController.saveUserActivity({
                user_id,
                task: 'Языковой материал',
                result: computeResult(result, rightAnswers.length),
                experience: computeExperience(),
                date: new Date(),
            });
        }
        return { rightAnswers, result };
    }

    async checkWritingTask(user_id, letterPartsAnswers, clichesAnswers, linkersAnswers, fullRepliesAnswers) {
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

        if (user_id) {
            await userController.saveUserActivity({
                user_id,
                task: 'Письмо',
                result: computeResult(result, 55),
                experience: computeExperience(),
                date: new Date(),
            });
        }

        return {
            letterPartsCorrectness,
            clichesCorrectness,
            linkersCorrectness,
            fullRepliesCorrectness,
            result
        };
    }
}

module.exports = new TaskController();
