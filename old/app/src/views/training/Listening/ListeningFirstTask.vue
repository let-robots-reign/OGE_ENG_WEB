<template>
  <main>
    <AppTrainingPage
      topic="Задания 1-4"
      has-explanations
      ref="page"
      @check-answers="checkAnswers"
    >
      <template #training-instruction>
        <p>
          Вы услышите четыре коротких текста, обозначенных буквами <strong>А, B, C, D</strong>.
        </p>
        <p>
          В заданиях <strong>1–4</strong> выберите подходящий ответ из 3 вариантов. Вы услышите запись дважды.
        </p>
      </template>

      <template #training-content>
        <div class="card audio-task">
          <div class="audio-section">
            <p class="audio-task__title">Аудио</p>
            <audio controls :src="question.audioPath"></audio>
          </div>
          <div class="task-section">
            <p class="audio-task__title">
              Задания
            </p>
            <div
              class="task-section__tasks"
              v-for="(task, index) in question.tasks"
              :key="task.task"
            >
              <p>{{ task.task }}</p>
              <base-radio-group
                class="task-section__options"
                :name="`audio-task-${index}`"
                :options="task.options"
                v-model="userAnswers[index]"
                vertical
              />
            </div>
          </div>
        </div>
      </template>
    </AppTrainingPage>
  </main>
</template>

<script>
import {onMounted, ref} from 'vue';
import AppTrainingPage from '@/components/base/AppTrainingPage';
import BaseRadioGroup from '@/components/form/BaseRadioGroup';

export default {
  name: 'FirstTask',
  components: {BaseRadioGroup, AppTrainingPage},
  setup() {
    const question = ref({});
    const userAnswers = ref(Array(4).fill(''));

    onMounted(async () => {
      question.value = {
        tasks: [
          {
            task: 'Today the customers can take part in ...',
            options: [
              'a children\'s book exhibition',
              'a lottery of international books.',
              'a workshop on making souvenirs.'
            ]
          },
          {
            task: 'Alice can’t go shopping with Mary because ...',
            options: [
              'it\'s her grandmother’s birthday.',
              'she has to help her grandmother.',
              'she is ill and has to see a doctor.'
            ]
          },
        ],
        audioPath: 'https://oge-eng.ru/files/audio/audio_topic1_task5.m4a',
      };
    });

    const checkAnswers = () => {
      console.log(userAnswers.value);
    };

    return {
      question,
      userAnswers,
      checkAnswers,
    };
  }
};
</script>

<style lang="scss" scoped>
main {
  flex-grow: 1;
  margin: 32px auto;
}

.audio-task {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 18px;
  padding: 1.5rem;

  audio {
    width: 70%;
    display: block;
    margin: 0 auto;
  }

  &__title {
    font-size: 1.7rem;
    font-weight: 700;
    margin-bottom: 16px;
  }
}

.task-section {
  &__options {
    margin: 12px 0 20px 0;
  }
}

@media screen and (max-width: 676px) {
  .audio-task {
    audio {
      width: 100%;
    }

    &__table {
      max-width: 100%;
    }
  }
}
</style>
