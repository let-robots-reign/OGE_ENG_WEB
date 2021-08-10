<template>
    <main class="main">
        <div class="main-page-sections">
            <div class="main-page-section">
                <p class="section-name">Тренировки</p>
                <div class="trainings-grid">
                    <router-link :to="{ name: 'Audio Tasks' }" class="training-link">
                        <TrainingCard title="Аудирование" image="ic_audio.svg" :progress="progress.audio"/>
                    </router-link>
                    <router-link :to="{ name: 'Reading Tasks' }" class="training-link">
                        <TrainingCard title="Чтение" image="ic_reading.svg" :progress="progress.reading"/>
                    </router-link>
                    <router-link :to="{ name: 'Use of English Tasks' }" class="training-link">
                        <TrainingCard title="Языковой материал" image="ic_use_of_english.svg"
                                      :progress="progress.useOfEng"/>
                    </router-link>
                    <!-- Writing doesn't have progress -->
                    <TrainingCard title="Письмо" image="ic_writing.svg"/>
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
                    <router-link class="theory-link" :to="{ name: 'General Theory' }">
                        <TheoryCard class="theory-grid__general" :title="'Общая информация об экзамене'"
                                    :image="'ic_exam.svg'"/>
                    </router-link>
                    <router-link class="theory-link" :to="{ name: 'Use of English Theory' }">
                        <TheoryCard class="theory-grid__uoe" :title="'Языковой материал'"
                                    :image="'ic_use_of_english.svg'"/>
                    </router-link>
                    <router-link class="theory-link" :to="{ name: 'Writing Theory' }">
                        <TheoryCard class="theory-grid__writing" :title="'Письмо'"
                                    :image="'ic_writing.svg'"/>
                    </router-link>
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
import TheoryCard from '@/components/TheoryCard';
import {onMounted, reactive, ref} from 'vue';

export default {
    name: 'MainPage',
    components: {TheoryCard, TestCard, TrainingCard},
    setup() {
        // TODO: stubbing tests data
        const testsResults = ref([30, 12, 32, null, 44, null, 1, 0, null, 22]);
        const maxTestPoints = ref(44);
        const progress = reactive({
            audio: 10,
            reading: 35,
            useOfEng: 70,
        });

        const store = useStore();
        onMounted(() => {
            API.getCurrentUser()
                .then(() => store.commit('auth/setAuth', true))
                .catch(() => store.commit('auth/setAuth', false));
        });

        return {
            testsResults,
            maxTestPoints,
            progress
        };
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
    width: 60%;
    margin: 0 auto;
}

.main-page-section {
    margin: 32px;
}

.section-name {
    font-size: 24px;
    margin-bottom: 16px;
}

.trainings-grid, .tests-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.training-link, .theory-link {
    text-decoration: none;
}

.theory-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
}

</style>
