import {createRouter, createWebHistory} from 'vue-router';
import MainPage from '@/views/MainPage';
import Login from '@/views/Login';
import Signup from '@/views/Signup';
import {PATHS} from '@/router/paths';

const routes = [
    {
        path: PATHS.main,
        component: MainPage
    },
    {
        path: PATHS.login,
        component: Login
    },
    {
        path: PATHS.signup,
        component: Signup
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
