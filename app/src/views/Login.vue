<template>
    <form class="form-sign-in" @submit.prevent="login">
        <h1 class="h3 mb-3 fw-normal">Войти</h1>
        <input v-model="data.email" type="email" class="form-control form-sign-in__email" placeholder="Почта">
        <input v-model="data.password" type="password" class="form-control form-sign-in__password"
               placeholder="Пароль">
        <button class="w-100 btn btn-lg btn-primary" type="submit">Войти</button>
    </form>
</template>

<style scoped>
.form-sign-in {
    width: 100%;
    max-width: 330px;
    margin: 0 auto;
}

.form-sign-in__password {
    margin-bottom: 12px;
}
</style>

<script>
import {reactive} from 'vue';
import {useRouter} from 'vue-router';
import {API} from '@/services/api';
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
            API.login(data).then(async () => {
                await router.push(PATHS.main);
            });
        };

        return {
            data,
            login
        };
    }
};
</script>
