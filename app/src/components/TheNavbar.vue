<template>
    <nav class="navbar">
        <router-link :to="{ name: 'Main Page' }" class="navbar-logo">ОГЭ Английский</router-link>

        <ul class="navbar-menu" v-if="auth">
            <li v-if="isAdmin">
                <router-link :to="{ name: 'Create Theory' }" class="nav-link">Создать</router-link>
            </li>
            <li>
                <router-link :to="{ name: 'Profile', params: { username } }" class="nav-link">Профиль</router-link>
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
        const isAdmin = computed(() => store.getters['auth/role'] === 'admin');
        const username = computed(() => store.getters['auth/username']);

        const logout = () => {
            API.logout().then(() => store.commit('auth/setUser', null));
        };

        return {
            auth,
            isAdmin,
            username,
            logout
        };
    }
};
</script>

<style lang="scss" scoped>
@import '@/variables';

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
  padding: 0;
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

@media screen and (max-width: 670px) {
  .navbar {
    height: auto;
    flex-direction: column;
    padding: 8px 0;
  }

  .navbar-menu {
    margin-top: 12px;
    margin-bottom: 20px;
  }
}

</style>
