<template>
    <main class="main">
        <div class="main-page-sections">
            <div class="main-page-section">
                <p class="section-name">Тренировки</p>
                <div class="trainings-grid">
                    <TrainingCard title="Аудирование" image="ic_audio.svg" progress="0"/>
                    <TrainingCard title="Чтение" image="ic_reading.svg" progress="0"/>
                    <TrainingCard title="Языковой материал" image="ic_use_of_english.svg" progress="0"/>
                    <TrainingCard title="Письмо" image="ic_writing.svg" progress="0"/>
                </div>
            </div>
            <div class="main-page-section">
                <p class="section-name">Варианты</p>
                <div class="tests-grid">
                    <TestCard v-for="(result, index) in testsResults" :key="index"
                              :index="index" :max-points="maxTestPoints" :result="result"/>
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

<script>
import {API} from '@/services/api';
import {useStore} from 'vuex';
import TrainingCard from '@/components/TrainingCard';
import TestCard from '@/components/TestCard';

export default {
    name: 'MainPage',
    components: {TestCard, TrainingCard},
    data() {
        return {
            // TODO: stubbing tests data
            testsResults: [30, 12, 32, null, 44, null, 1, 0, null, 22],
            maxTestPoints: 44
        };
    },
    created() {
        const store = useStore();
        API.getCurrentUser()
            .then(async () => {
                await store.dispatch('setAuth', true);
            })
            .catch(async () => {
                await store.dispatch('setAuth', false);
            });
    }
};
</script>

<style scoped>
body {
    margin-bottom: 60px;
}

.main {
    padding: 16px;
    color: var(--light-blue-shadow);
}

.main-page-sections {
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
}

.main-page-section {
    margin: 32px;
}

.section-name {
    font-size: 24px;
    font-family: 'Comfortaa';
}

.trainings-grid, .tests-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

</style>
