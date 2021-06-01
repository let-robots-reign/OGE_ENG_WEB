<template>
    <form @submit.prevent="login">
        <h1 class="h3 mb-3 fw-normal">Войти</h1>
        <input v-model="data.email" type="email" class="form-control" placeholder="Почта">
        <input v-model="data.password" type="password" class="form-control" placeholder="Пароль">
        <button class="w-100 btn btn-lg btn-primary" type="submit">Войти</button>
    </form>
</template>

<script>
import {reactive} from 'vue';
import {useRouter} from 'vue-router';
import {API} from '@/api';
import {OK_CODE} from '@/api/codes';
import {PATHS} from '@/router/paths';

export default {
    name: 'Login',
    setup() {
        const data = reactive({
            email: '',
            password: ''
        });
        const router = useRouter();

        const login = () => {
            API.login(data).then(async (response) => {
                if (response.status === OK_CODE) {
                    await router.push(PATHS.main);
                }
            });
        };

        return {
            data,
            login
        };
    }
};
</script>
