<template>
    <main>
        <AppBackFloatingButton/>

        <div v-if="user" class="card profile-card">
            <h1 class="heading">Профиль {{ user.name }}</h1>
            <hr/>
            <p class="main-info">
                Email: {{ user.email }}
            </p>
            <p class="main-info">
                Желаемая оценка: {{ user.desiredMark }}
            </p>
            <!--            <hr/>-->
            <!--            <p class="activity-history">-->
            <!--                В будущем обновлении здесь появятся Ваша история действий на сайте и статистика-->
            <!--            </p>-->
        </div>
        <div v-if="userActivity" class="card profile-card">
            <h1 class="heading">Последние действия</h1>
            <hr/>
            <template v-for="item in userActivity" :key="item._id">
                <div class="activity-item">
                    <h3 class="activity-item__task">{{ item.task }}</h3>
                    <div class="activity-item__info">
                        <span :class="['activity-item__result', getClassForResult(item.result)]">
                            {{ item.result }} верно
                        </span>
                        <span class="activity-item__experience">{{ item.experience }} ед. опыта</span>
                    </div>
                </div>
                <hr/>
            </template>
        </div>
    </main>
</template>

<script>
import {useStore} from 'vuex';
import AppBackFloatingButton from '@/components/base/AppBackFloatingButton';
import {computed, onMounted, ref} from 'vue';
import {API} from '@/services/api';

export default {
    name: 'Profile',
    components: {AppBackFloatingButton},
    setup() {
        const store = useStore();
        const user = computed(() => store.getters['auth/user']);
        const userActivity = ref([]);
        const getClassForResult = (result) => {
            const [points, total] = result.split('/').map(n => parseInt(n));
            const ratio = points / total;
            if (ratio >= 85) return 'result_good';
            if (ratio >= 60) return 'result_average';
            return 'result_bad';
        };

        onMounted(() => {
            API.getUserActivity()
                .then((res) => userActivity.value = res.data)
                .catch((err) => console.log(err));
        });

        return {user, userActivity, getClassForResult};
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

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;

  &__task {
    font-size: 1.5em;
  }

  &__info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    font-size: 18px;
  }

  &__experience {
    color: #4C4A9E;
    font-weight: bold;
  }
}

.result {
  &_good {
    color: limegreen;
  }

  &_average {
    color: orange;
  }

  &_bad {
    color: red;
  }
}
</style>