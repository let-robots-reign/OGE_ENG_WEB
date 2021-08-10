<template>
    <form class="card form-card" @submit.prevent="signup">
        <h1 class="form-card__title">Создать аккаунт</h1>

        <div class="form-control">
            <label for="username">Имя пользователя</label>
            <input type="text" id="username" v-model="formData.name">
        </div>

        <div class="form-control">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="formData.email">
        </div>

        <div class="form-control">
            <label for="password">Пароль</label>
            <input type="password" id="password" v-model="formData.password">
        </div>

        <button class="btn primary" type="submit">Регистрация</button>
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
        const formData = reactive({
            name: '',
            email: '',
            password: ''
        });

        const router = useRouter();
        const signup = () => {
            API.signup(formData)
                .then(async () => await router.push(PATHS.main))
                .catch(() => console.log('Неудачная регистрация!'));
        };

        return {
            formData,
            signup
        };
    }
};
</script>

