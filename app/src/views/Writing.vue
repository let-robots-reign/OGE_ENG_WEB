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
                    <a href="/">Ссылка на теорию</a>
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
                                    class="letter-answers__input"
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
                            <span v-for="(word, wordIndex) in cliche.split(' ')" :key="wordIndex">
                                <BaseSelect
                                    v-model="clichesAnswers[clicheIndex][wordIndex]"
                                    :options="clichesOptions[clicheIndex]"
                                    class="autofit"
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
                                class="autofit"
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
                                    class="autofit"
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
                            />
                        </div>
                    </div>
                </div>
            </template>

        </AppTrainingPage>
    </main>
</template>

<script>
import AppTrainingPage from '@/components/AppTrainingPage';
import {onMounted, ref} from 'vue';
import {API} from '@/services/api';
import BaseInput from '@/components/form/BaseInput';
import BaseSelect from '@/components/form/BaseSelect';
import BaseRadioGroup from '@/components/form/BaseRadioGroup';
import { shuffle } from '@/utils/shuffle';

export default {
    name: 'Writing',
    components: {BaseInput, BaseSelect, BaseRadioGroup, AppTrainingPage},
    setup() {
        const page = ref([]);

        const letterParts = ref([]);
        const letterPartsAnswers = ref([]);
        const cliches = ref([]);
        const clichesOptions = ref([]);
        const clichesAnswers = ref([]);
        const linkers = ref([]);
        const linkersOptions = ref([]);
        const linkersAnswers = ref([]);
        const fullReplies = ref([]);
        const fullRepliesOptions = ref([]);
        const fullRepliesAnswers = ref([]);

        const userAnswers = ref([]);

        onMounted(async () => {
            API.getWritingTraining()
                .then((result) => {
                    const task = result.data.task;
                    console.log(task);
                    letterParts.value = task.structure[0].task.split('\r\n');
                    cliches.value = task.cliches.map(object => object.task);
                    clichesOptions.value = task.cliches.map(object => object.options);
                    clichesAnswers.value = cliches.value.map((cliche) => cliche.split(' '));
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

        const checkAnswers = () => {

        };

        return {
            page,
            letterParts,
            letterPartsAnswers,
            cliches,
            clichesOptions,
            clichesAnswers,
            linkers,
            linkersOptions,
            linkersAnswers,
            fullReplies,
            fullRepliesOptions,
            fullRepliesAnswers,
            userAnswers,
            checkAnswers
        };
    }
};
</script>

<style lang="scss" scoped>
main {
  width: 50%;
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

  &__input {
      margin-bottom: 0;
  }
}
</style>
