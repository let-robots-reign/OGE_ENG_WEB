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
                        <p>
                            Поставьте предложения в правильном порядке, чтобы получилось письмо.
                        </p>
<!--                        <p v-for="(part, index) in task.letterParts" :key="index">-->
<!--                            {{ part }}-->
<!--                        </p>-->
                        <div class="letter-answers">
                            <p><em>Впишите номера предложений в нужном порядке</em></p>
<!--                            TODO: BaseInput v-for -->
                        </div>
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
export default {
    name: 'Writing',
    components: {AppTrainingPage},
    setup() {
        const page = ref([]);
        const letterParts = ref([]);
        const userAnswers = ref([]);

        onMounted(async () => {
            API.getWritingTraining()
                .then((result) => {
                    const task = result.data.task;

                    letterParts.value = task.structure;

                })
                .catch((err) => console.log(err));
        });

        const checkAnswers = () => {

        };

        return {
            page,
            letterParts,
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
         margin-bottom: 12px;
     }
}
</style>
