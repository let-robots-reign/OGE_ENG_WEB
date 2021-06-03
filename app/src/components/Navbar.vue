<template>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4 ps-4 pe-4">
        <div class="container-fluid">
            <router-link :to="{ name: 'Main Page' }" class="navbar-brand me-2">ОГЭ English</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse"
                    aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
                <ul class="navbar-nav ms-auto mb-2 mb-md-0" v-if="!auth">
                    <li class="nav-item px-3">
                        <router-link :to="{ name: 'Login' }" class="nav-link">Войти</router-link>
                    </li>
                    <li class="nav-item px-3">
                        <router-link :to="{ name: 'Signup' }" class="nav-link">Регистрация</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto mb-2 mb-md-0" v-else>
                    <li class="nav-item">
                        <router-link :to="{ name: 'Main Page' }" class="nav-link">Профиль</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link :to="{ name: 'Login' }" class="nav-link" @click="logout">Выход</router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import {useStore} from 'vuex';
import {computed} from 'vue';
import {API} from '@/services/api';

export default {
    name: 'Navbar',
    setup() {
        const store = useStore();
        const auth = computed(() => store.state.authenticated);

        const logout = () => {
            API.logout().then(async () => {
                await store.dispatch('setAuth', false);
            });
        };

        return {
            auth,
            logout
        };
    }
};
</script>
