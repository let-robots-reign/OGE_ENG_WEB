<template>
    <main>
        <AppBackFloatingButton/>

        <div class="card profile-card">
            <h1 class="heading">Профиль {{ user.name }}</h1>
            <hr/>
            <p class="main-info">
                Email: {{ user.email }}
            </p>
            <p class="main-info">
                Желаемая оценка: {{ user.desiredMark }}
            </p>
            <hr/>
            <p class="activity-history">
                В будущем обновлении здесь появятся Ваша история действий на сайте и статистика
            </p>
        </div>
    </main>
</template>

<script>
import {useStore} from 'vuex';
import AppBackFloatingButton from '@/components/AppBackFloatingButton';

export default {
    name: 'Profile',
    components: {AppBackFloatingButton},
    setup() {
        const store = useStore();
        const user = store.getters['auth/user'];

        return {user};
    },
};
</script>

<style lang="scss" scoped>
main {
  flex-grow: 1;
  margin: 32px auto;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.heading {
  text-align: center;
}

.main-info, .activity-history {
  font-size: 20px;
}
</style>