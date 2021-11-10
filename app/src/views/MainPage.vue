<template>
    <main class="main">
        <aside/>
        <div class="main-page-sections">
            <div class="main-page-section">
                <p class="section-name">Тренировки</p>
                <div class="trainings-grid">
                    <router-link :to="{ name: 'Audio Topics' }" class="training-link">
                        <TrainingCard title="Аудирование" image="ic_audio.svg"/>
                    </router-link>
                    <router-link :to="{ name: 'Reading Topics' }" class="training-link">
                        <TrainingCard title="Чтение" image="ic_reading.svg"/>
                    </router-link>
                    <router-link :to="{ name: 'Use of English Topics' }" class="training-link">
                        <TrainingCard title="Языковой материал" image="ic_use_of_english.svg"/>
                    </router-link>
                    <!-- Writing doesn't have progress -->
                    <router-link :to="{ name: 'Writing Training' }" class="training-link">
                        <TrainingCard title="Письмо" image="ic_writing.svg"/>
                    </router-link>
                </div>
            </div>
            <!--            <div class="main-page-section">-->
            <!--                <p class="section-name">Варианты</p>-->
            <!--                <div class="tests-grid">-->
            <!--                    <TestCard v-for="(result, index) in testsResults" :key="index"-->
            <!--                              :index="index" :max-points="maxTestPoints" :result="result"/>-->
            <!--                </div>-->
            <!--            </div>-->
            <div class="main-page-section">
                <p class="section-name">Теория</p>
                <div class="theory-grid">
                    <router-link class="theory-link" :to="{ name: 'General Theory' }">
                        <TheoryCard class="theory-grid__general" title="Общая информация об экзамене"
                                    image="ic_exam.svg"/>
                    </router-link>
                    <router-link class="theory-link" :to="{ name: 'Use of English Theory' }">
                        <TheoryCard class="theory-grid__uoe" title="Языковой материал"
                                    image="ic_use_of_english.svg"/>
                    </router-link>
                    <router-link class="theory-link" :to="{ name: 'Writing Theory' }">
                        <TheoryCard class="theory-grid__writing" title="Письмо"
                                    image="ic_writing.svg"/>
                    </router-link>
                </div>
            </div>
        </div>
        <aside/>
    </main>
</template>

<script>
import TrainingCard from '@/components/cards/TrainingCard';
import TheoryCard from '@/components/cards/TheoryCard';

export default {
    name: 'MainPage',
    components: {TheoryCard, TrainingCard}
};
</script>

<style lang="scss" scoped>
@import '@/variables';

body {
  margin-bottom: 60px;
}

.main {
  display: flex;
  padding: 16px;
  color: $light-blue-shadow;
}

aside {
  width: 20%;
}

.main-page-sections {
  flex-grow: 1;
}

.main-page-section {
  margin: 32px 0;
}

.section-name {
  font-size: 28px;
  margin-bottom: 16px;
}

.trainings-grid, .tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.training-link, .theory-link {
  text-decoration: none;
}

.theory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

@media screen and (max-width: 1100px) {
  aside {
    width: 0
  }
}

</style>
