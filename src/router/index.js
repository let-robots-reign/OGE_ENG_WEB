import {createRouter, createWebHistory} from 'vue-router';
import MainPage from "@/views/MainPage";
import Login from "@/views/Login";
import Signup from "@/views/Signup";

const routes = [
    {
        path: '',
        component: MainPage
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/signup',
        component: Signup
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
