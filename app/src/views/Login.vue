<template>
    <form class="card form-card" @submit.prevent="login">
        <h1 class="form-card__title">Войти в систему</h1>

        <div class="form-control">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="formData.email">
        </div>

        <div class="form-control">
            <label for="password">Пароль</label>
            <input type="password" id="password" v-model="formData.password">
        </div>

        <button class="btn primary" type="submit">Войти</button>
    </form>
</template>

<script>
import {reactive} from 'vue';
import {useRouter} from 'vue-router';
import {API} from '@/services/api';
import {PATHS} from '@/router/paths';

export default {
    name: 'Login',
    setup() {
        const formData = reactive({
            email: '',
            password: ''
        });
        const router = useRouter();

        const login = () => {
            API.login(formData)
                .then(async () => await router.push(PATHS.main))
                .catch(() => console.log('Неверный логин или пароль!'));
        };

        return {
            formData,
            login
        };
    }
};
</script>
