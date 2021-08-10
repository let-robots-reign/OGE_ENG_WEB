<template>
    <nav class="navbar">
        <router-link :to="{ name: 'Main Page' }" class="navbar-logo">ОГЭ Английский</router-link>

        <ul class="navbar-menu" v-if="auth">
            <li>
                <router-link :to="{ name: 'Main Page' }" class="nav-link">Профиль</router-link>
            </li>
            <li>
                <router-link :to="{ name: 'Login' }" class="nav-link" @click="logout">Выход</router-link>
            </li>
        </ul>
        <ul class="navbar-menu" v-else>
            <li>
                <router-link :to="{ name: 'Login' }" class="nav-link">Войти</router-link>
            </li>
            <li>
                <router-link :to="{ name: 'Signup' }" class="nav-link">Регистрация</router-link>
            </li>
        </ul>
    </nav>
</template>

<script>
import {useStore} from 'vuex';
import {API} from '@/services/api';
import {computed} from 'vue';

export default {
    name: 'TheNavbar',
    setup() {
        const store = useStore();
        const auth = computed(() => store.getters['auth/isAuthenticated']);

        const logout = () => {
            API.logout().then(() => store.commit('auth/setAuth', false));
        };

        return {
            auth,
            logout
        };
    }
};
</script>

<style lang="scss" scoped>
@import '../variables';

.navbar {
  height: $navbar-height;
  background-color: $white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.navbar-menu {
  display: flex;
  justify-content: center;
  align-content: center;
  gap: 16px;
  list-style: none;
}

.navbar-logo {
  font-size: 28px;
  font-weight: bold;
}

.nav-link {
  font-size: 20px;
}

.navbar-logo, .nav-link {
  padding: 8px;
}

</style>
