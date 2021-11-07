import {createRouter, createWebHistory} from 'vue-router';
import MainPage from '@/views/MainPage';
import Login from '@/views/Login';
import Signup from '@/views/Signup';
import {PATHS} from '@/router/paths';
import MenuList from '@/views/MenuList';
import MenuGrid from '@/views/MenuGrid';
import UseOfEnglish from '@/views/UseOfEnglish';
import Reading from '@/views/Reading';
import Listening from '@/views/Listening';
import Writing from '@/views/Writing';
import CreateTheory from '@/views/CreateTheory';
import TheoryArticle from '@/views/TheoryArticle';
import Profile from '@/views/Profile';

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
        name: 'Profile',
        path: PATHS.profile,
        component: Profile
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
        name: 'Audio Topics',
        path: PATHS.audioTrainingTopics,
        component: MenuList,
        props: {
            titles: ['Задание 1'],
            baseClickLink: '/training/audio'
        }
    },
    {
        name: 'Reading Topics',
        path: PATHS.readingTrainingTopics,
        component: MenuList,
        props: {
            titles: ['Задание 9'],
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
        name: 'Audio Training',
        path: PATHS.audioTraining,
        component: Listening,
        props: (route) => ({topic: route.query.topic})
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
        name: 'Writing Training',
        path: PATHS.writingTraining,
        component: Writing,
    },
    {
        name: 'General Theory',
        path: PATHS.generalTheory,
        component: MenuGrid,
        props: { category: 'general' },
    },
    {
        name: 'Use of English Theory',
        path: PATHS.uoeTheory,
        component: MenuGrid,
        props: { category: 'uoe' },
    },
    {
        name: 'Writing Theory',
        path: PATHS.writingTheory,
        component: MenuGrid,
        props: { category: 'writing' },
    },
    {
        name: 'Create Theory',
        path: PATHS.createTheory,
        component: CreateTheory,
        props: true,
    },
    {
        name: 'Theory Article',
        path: PATHS.theoryArticle,
        component: TheoryArticle,
        props: true,
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
