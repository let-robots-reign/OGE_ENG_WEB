import {createRouter, createWebHistory} from 'vue-router';
import MainPage from '@/views/MainPage';
import Login from '@/views/Login';
import Signup from '@/views/Signup';
import {PATHS} from '@/router/paths';
import MenuList from '@/views/MenuList';

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
        name: 'Audio Tasks',
        path: PATHS.audioTasks,
        component: MenuList,
        props: {
            titles: ['Задание 1', 'Задание 2', 'Задания 3-8']
        }
    },
    {
        name: 'Reading Tasks',
        path: PATHS.readingTasks,
        component: MenuList,
        props: {
            titles: ['Задание 9', 'Задания 10-17']
        }
    },
    {
        name: 'Use of English Tasks',
        path: PATHS.uoeTasks,
        component: MenuList,
        props: {
            titles: ['По всем темам', 'Словообразование']
        }
    }
];

const router = createRouter({
    // eslint-disable-next-line no-undef
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
