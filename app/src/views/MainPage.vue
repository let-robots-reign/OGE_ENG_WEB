<template>
    <main class="main">
        <div class="main-page-sections">
            <div class="main-page-section">
                <p class="section-name">Тренировки</p>
                <div class="trainings-grid">

                </div>
            </div>
            <div class="main-page-section">
                <p class="section-name">Варианты</p>
                <div class="tests-carousel">

                </div>
            </div>
            <div class="main-page-section">
                <p class="section-name">Теория</p>
                <div class="theory-grid">

                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
.main {
    height: 100vh;
    background-color: var(--dark-blue);
    padding: 16px;
    color: var(--light-blue-shadow);
}

.main-page-sections {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
}

.main-page-section {
    margin: 32px;
}

.section-name {
    font-size: 24px;
    font-family: 'Comfortaa';
}

</style>

<script>
import {API} from '@/services/api';
import {useStore} from 'vuex';
import {onMounted, ref} from 'vue';

export default {
    name: 'MainPage',
    setup() {
        const message = ref('You are not logged in!');
        const store = useStore();

        onMounted(async () => {
            API.getCurrentUser()
                .then(async (response) => {
                    message.value = `Hi, ${response.data.name}`;
                    await store.dispatch('setAuth', true);
                })
                .catch(async () => {
                    await store.dispatch('setAuth', false);
                });
        });
        return {
            message
        };
    }
};
</script>
