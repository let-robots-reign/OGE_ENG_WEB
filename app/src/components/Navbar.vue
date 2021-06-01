<template>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
        <div class="container-fluid">
            <router-link to="/" class="navbar-brand">ОГЭ English</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse"
                    aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
                <ul class="navbar-nav me-auto mb-2 mb-md-0">
                    <li class="nav-item">
                        <a class="nav-link" href="#">Тренировки</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Варианты</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Теория</a>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto mb-2 mb-md-0" v-if="!auth">
                    <li class="nav-item">
                        <router-link to="/login" class="nav-link">Войти</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/signup" class="nav-link">Регистрация</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav ms-auto mb-2 mb-md-0" v-else>
                    <li class="nav-item">
                        <router-link to="/" class="nav-link">Профиль</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/signup" class="nav-link" @click="logout">Выход</router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import {useStore} from 'vuex';
import {computed} from 'vue';
import {API} from '@/api';

export default {
    name: 'Navbar',
    setup() {
        const store = useStore();
        const auth = computed(() => store.state.authenticated);

        const logout = async () => {
            await API.logout();
        };

        return {
            auth,
            logout
        };
    }
};
</script>
