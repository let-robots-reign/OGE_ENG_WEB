<template>
  <main>
    <AppTrainingPage
      topic="Письмо"
      ref="page"
      @check-answers="checkAnswers"
    >
      <template #training-instruction>
        <p>
          Данная тренировка проверяет отдельные навыки, необходимые для написания письма:
        </p>
        <ol>
          <li>Знание структуры письма.</li>
          <li>Использование фраз-клише.</li>
          <li>Использование слов-связок.</li>
          <li>Умение дать полный ответ на вопрос.</li>
        </ol>
        <p>
          Для получения подробной информации обратитесь к соответствующим разделам Теории
        </p>
        <p>
          <router-link :to="{ name: 'Writing Theory' }" class="link-to-theory">
            Ссылка на теорию
          </router-link>
        </p>
      </template>

      <template #training-content>
        <div class="card writing-task">
          <div class="writing-task__section">
            <p class="writing-task__title">Структура письма</p>
            <p class="writing-task__hint">
              Поставьте предложения в правильном порядке, чтобы получилось письмо.
            </p>
            <p v-for="(part, index) in letterParts" :key="index">
              {{ index + 1 }}) {{ part }}
            </p>
            <div class="letter-answers">
              <BaseInput
                v-for="index in letterParts.length"
                :key="index"
                :placeholder="index.toString()"
                v-model="letterPartsAnswers[index - 1]"
                :class="[
                                            'letter-answers__input', 
                                            getClassForUserInput(letterPartsCorrectness, index),
                                            { 'no-borders': index > 1 && index < letterParts.length,
                                              'first-item': index === 1, 'last-item': index === letterParts.length}
                                            ]"
                :disabled="controlsDisabled"
              />
            </div>
            <p class="writing-task__hint">Впишите номера предложений в нужном порядке</p>
          </div>

          <div class="writing-task__section">
            <p class="writing-task__title">Фразы-клише</p>
            <p class="writing-task__hint">
              Расставьте слова по порядку
            </p>
            <p v-for="(cliche, clicheIndex) in cliches" :key="clicheIndex">
              {{ clicheIndex + 1 }})
              <span v-for="(word, wordIndex) in cliche.split(' ')" :key="word">
                                <BaseSelect
                                  v-model="clichesAnswers[clicheIndex][wordIndex]"
                                  :options="clichesOptions[clicheIndex]"
                                  :class="[
                                            'autofit', 
                                            getClassForUserInput(clichesCorrectness[clicheIndex], wordIndex)
                                            ]"
                                  :disabled="controlsDisabled"
                                />
                            </span>
            </p>
          </div>

          <div class="writing-task__section">
            <p class="writing-task__title">Слова-связки</p>
            <p class="writing-task__hint">
              Совместите слова-связки с их русскими эквивалентами
            </p>
            <p v-for="(linker, linkerIndex) in linkers[0]" :key="linker">
              {{ linkerIndex + 1 }}) {{ linker }} -
              <BaseSelect
                v-model="linkersAnswers[0][linkerIndex]"
                :options="linkersOptions[0]"
                :class="['autofit', getClassForUserInput(linkersCorrectness[0], linkerIndex)]"
                :disabled="controlsDisabled"
              />
            </p>
            <p class="writing-task__hint">
              Дополните текст, используя слова-связки
            </p>
            <div v-for="(task, index) in linkers.slice(1)" :key="index">
              {{ index + 1 }})
              <span v-for="(text, textIndex) in task" :key="text">
                                <BaseSelect
                                  v-model="linkersAnswers[index + 1][textIndex]"
                                  :options="linkersOptions[index + 1]"
                                  :class="['autofit', getClassForUserInput(linkersCorrectness[index], textIndex)]"
                                  :disabled="controlsDisabled"
                                />
                                {{ text }}
                            </span>
            </div>
          </div>

          <div class="writing-task__section">
            <p class="writing-task__title">
              Полные ответы
            </p>
            <div
              class="writing-task__full-replies"
              v-for="(fullReplyTask, index) in fullReplies" :key="index"
            >
              <p class="writing-task__hint">
                Выберите лучший ответ на вопрос
              </p>
              <p><strong>{{ fullReplyTask }}</strong></p>
              <BaseRadioGroup
                :name="`fullRepliesRadio-${index}`"
                :options="fullRepliesOptions[index]"
                v-model="fullRepliesAnswers[index]"
                vertical
                :disabled="controlsDisabled"
                :isChosenCorrect="fullRepliesCorrectness[index]"
              />
            </div>
          </div>
        </div>
      </template>
    </AppTrainingPage>
  </main>
</template>

<script>
import AppTrainingPage from '@/components/base/AppTrainingPage';
import {computed, onMounted, ref} from 'vue';
import {API} from '@/services/api';
import BaseInput from '@/components/form/BaseInput';
import BaseSelect from '@/components/form/BaseSelect';
import BaseRadioGroup from '@/components/form/BaseRadioGroup';
import {shuffle} from '@/utils/shuffle';
import {useStore} from 'vuex';

export default {
  name: 'Writing',
  components: {BaseInput, BaseSelect, BaseRadioGroup, AppTrainingPage},
  setup() {
    const store = useStore();
    const page = ref([]);

    const letterParts = ref([]);
    const letterPartsAnswers = ref([]);
    const letterPartsCorrectness = ref([]);
    const cliches = ref([]);
    const clichesOptions = ref([]);
    const clichesAnswers = ref([]);
    const clichesCorrectness = ref([]);
    const linkers = ref([]);
    const linkersOptions = ref([]);
    const linkersAnswers = ref([]);
    const linkersCorrectness = ref([]);
    const fullReplies = ref([]);
    const fullRepliesOptions = ref([]);
    const fullRepliesAnswers = ref([]);
    const fullRepliesCorrectness = ref([]);

    const rightAnswersNumber = ref(0);
    const result = computed(() => {
      const total = [letterParts.value, ...cliches.value, ...linkers.value, fullReplies.value].flat().length;
      return `Ваш результат: ${rightAnswersNumber.value}/${total}`;
    });

    onMounted(async () => {
      API.getWritingTraining()
        .then((result) => {
          const task = result.data.task;
          letterParts.value = task.structure[0].task.split('\r\n');
          letterPartsAnswers.value = Array(letterParts.value.length).fill('');
          cliches.value = task.cliches.map(object => object.task);
          clichesOptions.value = task.cliches.map(object => object.options);
          clichesAnswers.value = JSON.parse(JSON.stringify(clichesOptions.value));
          linkers.value = task.linkers.map(object => object.task.split('\r\n'));
          linkersOptions.value = task.linkers.map(object => object.options);
          linkersOptions.value.forEach((options) => shuffle(options));
          linkersAnswers.value = JSON.parse(JSON.stringify(linkersOptions.value));
          fullReplies.value = task.fullAnswers.map((full) => full.task.split('\r\n')[0]);
          fullRepliesOptions.value = task.fullAnswers.map((full) => full.task.split('\r\n').slice(1, 4));
          fullRepliesAnswers.value = Array(fullReplies.value.length).fill('');

          page.value.setShowInstruction(true);
        })
        .catch((err) => console.log(err));
    });

    const checkAnswers = async () => {
      page.value.setIsChecking(true);

      const answers = {
        letterPartsAnswers: letterPartsAnswers.value.map((answer) => letterParts.value[answer - 1]),
        clichesAnswers: clichesAnswers.value,
        linkersAnswers: linkersAnswers.value,
        fullRepliesAnswers: fullRepliesAnswers.value.map((answer, i) =>
          fullRepliesOptions.value[i].indexOf(answer) + 1)
      };

      const payload = {user_id: store.getters['auth/user_id'], answers};
      const {data} = await API.checkTraining('writing', payload);
      letterPartsCorrectness.value = data.letterPartsCorrectness;
      clichesCorrectness.value = data.clichesCorrectness;
      linkersCorrectness.value = data.linkersCorrectness;
      fullRepliesCorrectness.value = data.fullRepliesCorrectness;
      rightAnswersNumber.value = data.result;

      page.value.setResult(result.value);
    };

    const getClassForUserInput = (correctnessArray, index) =>
      (!correctnessArray || !correctnessArray.length) ? null : (correctnessArray[index] ? 'valid' : 'invalid');

    const controlsDisabled = computed(() => page.value.isChecked);

    return {
      page,
      letterParts,
      letterPartsAnswers,
      letterPartsCorrectness,
      cliches,
      clichesOptions,
      clichesAnswers,
      clichesCorrectness,
      linkers,
      linkersOptions,
      linkersAnswers,
      linkersCorrectness,
      fullReplies,
      fullRepliesOptions,
      fullRepliesAnswers,
      fullRepliesCorrectness,
      result,
      getClassForUserInput,
      checkAnswers,
      controlsDisabled,
    };
  }
};
</script>

<style lang="scss" scoped>
main {
  flex-grow: 1;
  margin: 32px auto;
}

.writing-task {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 18px;
  padding: 1.5rem;

  &__title {
    font-size: 1.7rem;
    font-weight: 700;
  }

  &__hint {
    margin: 20px 0 16px 0;
    font-style: italic;
    text-align: center;
  }
}

.letter-answers {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  max-width: 70%;
  margin: 16px auto 0 auto;

  .form-control {
    margin-bottom: 0;
  }
}

.link-to-theory {
  color: #4DA8DA;

  &:hover {
    text-decoration-color: #4DA8DA;
  }
}
</style>
