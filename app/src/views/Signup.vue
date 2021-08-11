<template>
    <form class="card form-card" @submit.prevent="signup">
        <h1 class="form-card__title">Создать аккаунт</h1>

        <BaseInput label="Имя пользователя" type="text" v-model="formData.name"/>
        <BaseInput label="Email" type="email" v-model="formData.email"/>
        <BaseInput label="Пароль" type="password" v-model="formData.password"/>

        <button class="btn primary" type="submit">Регистрация</button>
    </form>
</template>

<script>
import {reactive} from 'vue';
import {API} from '@/services/api';
import {useRouter} from 'vue-router';
import {PATHS} from '@/router/paths';
import BaseInput from '@/components/form/BaseInput';

export default {
    name: 'Signup',
    components: {BaseInput},
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

