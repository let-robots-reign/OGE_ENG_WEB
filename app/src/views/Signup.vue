<template>
    <form class="card form-card center" @submit.prevent="signup" novalidate>
        <h1 class="form-card__title">Создать аккаунт</h1>

        <BaseInput label="Имя пользователя" type="text" v-model="v$.name.$model"
                   :valid="!v$.name.$error && v$.name.$dirty" :errors="v$.name.$errors"/>

        <BaseInput label="Email" type="email" v-model="v$.email.$model"
                   :valid="!v$.email.$error && v$.email.$dirty" :errors="v$.email.$errors"/>

        <BaseInput label="Пароль" type="password" v-model="v$.password.$model"
                   :valid="!v$.password.$error && v$.password.$dirty" :errors="v$.password.$errors"/>

        <BaseSelect
                label="Желаемая отметка на экзамене"
                :options="[3, 4, 5]"
                v-model="signupState.desiredMark"
        />

        <small class="form-error-message" v-if="signupResult">{{ signupResult }}</small>
        <button class="btn btn-block primary" type="submit" :disabled="v$.$error">Регистрация</button>
    </form>
</template>

<script>
import {reactive, ref} from 'vue';
import {API} from '@/services/api';
import {useRouter} from 'vue-router';
import {PATHS} from '@/router/paths';
import BaseInput from '@/components/form/BaseInput';
import {email, helpers, minLength, required} from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import vconst from '@/const/validation';
import BaseSelect from '@/components/form/BaseSelect';
import {useStore} from 'vuex';

export default {
    name: 'Signup',
    components: {BaseSelect, BaseInput},
    setup() {
        const signupState = reactive({
            name: '',
            email: '',
            password: '',
            desiredMark: 3,
        });

        const rules = {
            name: {
                required: helpers.withMessage(
                    'Поле не может быть пустым',
                    required
                ),
                min: helpers.withMessage(
                    `Имя должно быть не короче ${vconst.MIN_USERNAME_LENGTH} символов`,
                    minLength(vconst.MIN_USERNAME_LENGTH)
                )
            },
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

        const v$ = useVuelidate(rules, signupState);

        const signupResult = ref('');
        const router = useRouter();
        const store = useStore();
        const signup = () => {
            v$.value.$touch();
            if (v$.value.$error) {
                return;
            }
            API.signup(signupState)
                .then(async (res) => {
                    store.commit('auth/setUser', res.data.user);
                    await router.push(PATHS.main);
                })
                .catch(() => {
                    store.commit('auth/setUser', null);
                    signupResult.value = 'Ошибка при регистрации!';
                });
        };

        return {
            signupState,
            signupResult,
            v$,
            signup
        };
    }
};
</script>

