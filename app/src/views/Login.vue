<template>
    <form class="card form-card" @submit.prevent="login">
        <h1 class="form-card__title">Войти в систему</h1>

        <BaseInput label="Email" type="text" v-model="formData.email"/>
        <BaseInput label="Пароль" type="password" v-model="formData.password"/>

        <button class="btn btn-block primary" type="submit">Войти</button>
    </form>
</template>

<script>
import {reactive} from 'vue';
import {useRouter} from 'vue-router';
import {API} from '@/services/api';
import {PATHS} from '@/router/paths';
import BaseInput from '@/components/form/BaseInput';

export default {
    name: 'Login',
    components: {BaseInput},
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
