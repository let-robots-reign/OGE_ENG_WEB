<template>
    <form class="card form-card center" @submit.prevent="login" novalidate>
        <h1 class="form-card__title">Войти в систему</h1>

        <BaseInput label="Email" type="email" v-model="v$.email.$model"
                   :valid="!v$.email.$error && v$.email.$dirty" :errors="v$.email.$errors"/>

        <BaseInput label="Пароль" type="password" v-model="v$.password.$model"
                   :valid="!v$.password.$error && v$.password.$dirty" :errors="v$.password.$errors"/>

        <small class="form-error-message" v-if="loginResult">{{ loginResult }}</small>
        <button class="btn btn-block primary" type="submit" :disabled="v$.$error">Войти</button>
    </form>
</template>

<script>
import BaseInput from '@/components/form/BaseInput';
import {reactive, ref} from 'vue';
import {email, helpers, minLength, required} from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import {useRouter} from 'vue-router';
import {API} from '@/services/api';
import {PATHS} from '@/router/paths';
import vconst from '@/const/validation';
import {useStore} from 'vuex';

export default {
    name: 'Login',
    components: {BaseInput},
    setup() {
        const loginState = reactive({
            email: '',
            password: ''
        });

        const rules = {
            email: {
                required: helpers.withMessage(
                    'Поле не может быть пустым',
                    required
                ),
                email: helpers.withMessage(
                    'Некорректный адрес электронной почты',
                    email
                )
            },
            password: {
                required: helpers.withMessage(
                    'Поле не может быть пустым',
                    required
                ),
                min: helpers.withMessage(
                    `Пароль должен быть не короче ${vconst.MIN_PASSWORD_LENGTH} символов`,
                    minLength(vconst.MIN_PASSWORD_LENGTH)
                )
            }
        };

        const v$ = useVuelidate(rules, loginState);

        const loginResult = ref('');
        const router = useRouter();
        const store = useStore();
        const login = () => {
            v$.value.$touch();
            if (v$.value.$error) {
                return;
            }
            API.login(loginState)
                .then(async (res) => {
                    store.commit('auth/setUser', res.data.user);
                    await router.push(PATHS.main);
                })
                .catch(() => {
                    store.commit('auth/setUser', null);
                    loginResult.value = 'Неверный логин или пароль!';
                });
        };

        return {
            loginState,
            loginResult,
            v$,
            login
        };
    }
};
</script>
