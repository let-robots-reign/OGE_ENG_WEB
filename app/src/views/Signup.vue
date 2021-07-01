<template>
    <form class="form-sign-up" @submit.prevent="signup">
        <h1 class="h3 mb-3 fw-normal">Создать аккаунт</h1>
        <input v-model="data.name" type="text" class="form-control form-sign-up__name"
               placeholder="Имя пользователя">
        <input v-model="data.email" type="email" class="form-control form-sign-up__email"
               placeholder="Почта">
        <input v-model="data.password" type="password" class="form-control form-sign-up__password"
               placeholder="Пароль">
        <button class="w-100 btn btn-lg btn-primary" type="submit">Регистрация</button>
    </form>
</template>

<script>
import {reactive} from 'vue';
import {API} from '@/services/api';
import {useRouter} from 'vue-router';
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
            API.signup(data).then(async () => {
                await router.push(PATHS.main);
            });
        };

        return {
            data,
            signup
        };
    }
};
</script>

<style scoped>
.form-sign-up {
    width: 100%;
    max-width: 330px;
    margin: 0 auto;
}

.form-sign-up__password {
    margin-bottom: 12px;
}
</style>
