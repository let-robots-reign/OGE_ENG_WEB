import {createRouter, createWebHistory} from 'vue-router';
import MainPage from '@/views/MainPage';
import Login from '@/views/Login';
import Signup from '@/views/Signup';
import {PATHS} from '@/router/paths';
import MenuList from '@/views/MenuList';
import MenuGrid from '@/views/MenuGrid';
import UseOfEnglish from '@/views/UseOfEnglish';
import Reading from '@/views/Reading';

const routes = [
    {
        name: 'Main Page',
        path: PATHS.main,
        component: MainPage
    },
    {
        name: 'Login',
        path: PATHS.login,
        component: Login
    },
    {
        name: 'Signup',
        path: PATHS.signup,
        component: Signup
    },
    {
        name: 'Audio Topics',
        path: PATHS.audioTrainingTopics,
        component: MenuList,
        props: {
            titles: ['Задание 1', 'Задание 2', 'Задания 3-8'],
            baseClickLink: '/training/audio'
        }
    },
    {
        name: 'Reading Topics',
        path: PATHS.readingTrainingTopics,
        component: MenuList,
        props: {
            titles: ['Задание 9', 'Задания 10-17'],
            baseClickLink: '/training/reading'
        }
    },
    {
        name: 'Use of English Topics',
        path: PATHS.uoeTrainingTopics,
        component: MenuList,
        props: {
            titles: ['По всем темам', 'Словообразование', 'Множественное число существительных',
                'Порядковые числительные', 'Объектные местоимения', 'Степени сравнения',
                'Притяжательные и возвратные местоимения', 'Пассивный залог', 'Глагол to be', 'I wish + V2',
                'Модальные глаголы', 'Условное предложение (реальное)', 'Условное предложение (нереальное)',
                'Настоящее Простое/Продолженное', 'Настоящее/Прошедшее Совершенное', 'Прошедшее Простое',
                'Прошедшее Продолженное', 'Будущее Простое', 'Would + V'],
            baseClickLink: '/training/use-of-english'
        }
    },
    {
        name: 'Reading Training',
        path: PATHS.readingTraining,
        component: Reading,
        props: (route) => ({topic: route.query.topic})
    },
    {
        name: 'Use Of English Training',
        path: PATHS.uoeTraining,
        component: UseOfEnglish,
        props: (route) => ({topic: route.query.topic})
    },
    {
        name: 'General Theory',
        path: PATHS.generalTheory,
        component: MenuGrid,
        props: {
            gridItems: ['Порядок проведения', 'Аудирование', 'Чтение', 'Языковой материал', 'Письмо']
        }
    },
    {
        name: 'Use of English Theory',
        path: PATHS.uoeTheory,
        component: MenuGrid,
        props: {
            gridItems: ['Множественное число существительных', 'Порядковые числительные', 'Притяжательные местоимения',
                'Объектные местоимения', 'Возвратные местоимения', 'Пассивный залог', 'I wish + V2',
                'Условное предложение (реальное)', 'Условное предложение (нереальное)', 'Формы глагола to be',
                'Модальные глаголы', 'Настоящее простое', 'Настоящее продолженное', 'Настоящее совершённое',
                'Прошедшее простое', 'Прошедшее продолженное', 'Прошедшее совершённое', 'Будущее простое',
                'Степени сравнения прилагательных', 'would + V']
        }
    },
    {
        name: 'Writing Theory',
        path: PATHS.writingTheory,
        component: MenuGrid,
        props: {
            gridItems: ['Алгоритм написания', 'Фразы-клише', 'Слова-связки']
        }
    }
];

const router = createRouter({
    // eslint-disable-next-line no-undef
    history: createWebHistory(process.env.BASE_URL),
    routes,
    linkActiveClass: 'active',
    linkExactActiveClass: 'active'
});

export default router;
