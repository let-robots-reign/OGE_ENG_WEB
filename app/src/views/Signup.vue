<template>
    <form @submit.prevent="signup">
        <h1 class="h3 mb-3 fw-normal">Создать аккаунт</h1>
        <input v-model="data.name" type="text" class="form-control" placeholder="Имя пользователя">
        <input v-model="data.email" type="email" class="form-control" placeholder="Почта">
        <input v-model="data.password" type="password" class="form-control" placeholder="Пароль">
        <button class="w-100 btn btn-lg btn-primary" type="submit">Регистрация</button>
    </form>
</template>

<script>
import {reactive} from 'vue';
import {API} from '@/api';
import {useRouter} from 'vue-router';
import {CREATED_CODE} from '@/api/codes';
import {PATHS} from '@/router/paths';

export default {
    name: 'Signup',
    setup() {
        const data = reactive({
            name: '',
            email: '',
            password: ''
        });
        const router = useRouter();

        const signup = () => {
            API.signup(data).then(async (response) => {
                if (response.status === CREATED_CODE) {
                    await router.push(PATHS.main);
                }
            });
        };

        return {
            data,
            signup
        };
    }
};
</script>
