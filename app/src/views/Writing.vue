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
                                    :placeholder="index"
                                    v-model="letterPartsAnswers[index - 1]"
                                    class="letter-answers__input"
                            />
                        </div>
                        <p class="writing-task__hint">Впишите номера предложений в нужном порядке</p>
                    </div>

                    <div class="writing-task__section">
                        <p class="writing-task__title">Фразы-клише</p>
                        <p>
                            Расставьте слова по порядку.
                        </p>
            <!--                        <p v-for="(cliche, index) in task.cliches" :key="index">-->
            <!--                            {{ index + 1 }})-->
            <!--                            <span v-for="(word, index) in cliche" :key="index">{{ word }}</span>-->
            <!--&lt;!&ndash;                            TODO: BaseSelect v-for &ndash;&gt;-->
            <!--                        </p>-->
                    </div>

                    <div class="writing-task__section">
                        <p class="writing-task__title">Слова-связки</p>
                        <p>
                            Совместите слова-связки с их русскими эквивалентами.
                        </p>
                        <!--                        <p v-for="(linker, index) in task.linkers" :key="index">-->
                        <!--                            {{ index + 1 }}) {{ linker }} - -->
                        <!--                        </p>-->
                        <p>
                            Дополните текст, используя слова-связки
                        </p>
                    </div>

                    <div class="writing-task__section">
                        <p class="writing-task__title">
                            Полные ответы
                        </p>
                <!--                        <div class="writing-task__full-answers"-->
                <!--                             v-for="(fullAnswersTask, index) in task.fullAnswers" :key="index">-->
                <!--                            <p>-->
                <!--                                Выберите лучший ответ на вопрос-->
                <!--                            </p>-->
                <!--                            <p>{{ fullAnswersTask.question }}</p>-->
                <!--&lt;!&ndash;                         TODO: add v-model &ndash;&gt;-->
                <!--                            <BaseRadioGroup-->
                <!--                                    name="fullAnswersRadio"-->
                <!--                                    :options="fullAnswersTask.options"-->
                <!--                                    vertical-->
                <!--                            />-->
                <!--                        </div>-->
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

export default {
    name: 'Writing',
    components: {BaseInput, AppTrainingPage},
    setup() {
        const page = ref([]);

        const letterParts = ref([]);
        const letterPartsAnswers = ref([]);

        const userAnswers = ref([]);

        onMounted(async () => {
            API.getWritingTraining()
                .then((result) => {
                    const task = result.data.task;
                    console.log(task);
                    letterParts.value = task.structure[0].task.split('\r\n');
                    console.log(letterParts.value);
                })
                .catch((err) => console.log(err));
        });

        const checkAnswers = () => {

        };

        return {
            page,
            letterParts,
            letterPartsAnswers,
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
    margin: 24px 0;
    font-style: italic;
    text-align: center;
  }
}

.letter-answers {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  max-width: 70%;
  margin: 16px auto;
}
</style>
