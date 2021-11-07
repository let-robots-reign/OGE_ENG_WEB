<template>
    <main>
        <AppTrainingPage
                :topic="topic"
                has-explanations
                ref="page"
                @check-answers="checkAnswers"
        >
            <template #training-instruction>
                <p>
                    Вы услышите четыре коротких диалога, обозначенных буквами <strong>A-D</strong>.
                </p>
                <p>
                    Установите соответствие между диалогами и местами, где они происходят: к каждому диалогу подберите
                    соответствующее место действия, обозначенное цифрами.
                </p>
                <p>
                    Используйте каждое место действия из списка <strong>1-5</strong> только один раз. В задании есть
                    одно лишнее место действия.
                </p>
            </template>

            <template #training-content>
                <div class="card audio-task">
                    <div class="audio-section">
                        <p class="audio-task__title">Аудио</p>
                        <audio controls :src="question.audioPath"></audio>
                    </div>
                    <div class="task-section">
                        <p class="audio-task__title">Варианты ответов</p>
                        <p v-for="(option, index) in answerOptions" :key="index">{{ option }}</p>
                    </div>
                    <div class="answers-section">
                        <p><em>Запишите в таблицу выбранные цифры под соответствующими буквами.</em></p>
                        <table class="audio-task__table">
                            <tr>
                                <td v-for="letter in ['A', 'B', 'C', 'D']" :key="letter">{{ letter }}</td>
                            </tr>
                            <tr>
                                <td v-for="(num, index) in 4" :key="index">
                                    <BaseInput
                                            :class="classForInput(index)"
                                            :placeholder="num.toString()"
                                            v-model="userAnswers[index]"
                                            @input="validateAnswer(index)"
                                    />
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </template>

            <template #training-explanations>
                <AppTrainingExplanation
                        :explanation="explanation"
                        :user-answers="userAnswersExtended"
                        :right-answers="rightAnswersExtended"
                />
            </template>
        </AppTrainingPage>
    </main>
</template>

<script>
import AppTrainingPage from '@/components/AppTrainingPage';
import {computed, onMounted, ref} from 'vue';
import {API} from '@/services/api';
import BaseInput from '@/components/form/BaseInput';
import AppTrainingExplanation from '@/components/AppTrainingExplanation';

export default {
    name: 'Listening',
    components: {BaseInput, AppTrainingPage, AppTrainingExplanation},
    props: {
        topic: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const page = ref(null);
        const question = ref({});
        const userAnswers = ref([]);

        onMounted(async () => {
            API.getAudioTraining(props.topic)
                .then((res) => {
                    question.value = res.data.question;
                    userAnswers.value = Array(answerOptions.value.length - 1).fill('');
                    page.value.setShowInstruction(true);
                })
                .catch((err) => console.log(err));
        });

        const answerOptions = computed(() => question.value.task?.split('\r\n'));
        /*
        Ответы приходят и сравниваются в виде чисел, но для объяснения пользователю нам нужно отобразить ответ в полном виде.
        Например, вместо "1" показывать "1. At home".
        */
        const extendAnswer = (answer) => answerOptions.value[answer - 1];
        const userAnswersExtended = computed(() => userAnswers.value.map(extendAnswer));
        const rightAnswersExtended = computed(() => rightAnswers.value.map(extendAnswer));

        const rightAnswers = ref(null);
        const explanation = ref('');
        const rightAnswersNumber = ref(null);
        const correctness = ref(null);
        const result = computed(() => `Ваш результат: ${rightAnswersNumber.value}/${correctness.value.length}`);

        const checkAnswers = async () => {
            page.value.setIsChecking(true);

            const payload = {_id: question.value._id, answers: userAnswers.value};
            const resultResponse = await API.checkTraining('audio', payload);

            rightAnswers.value = resultResponse.data.rightAnswers;
            explanation.value = resultResponse.data.explanation;
            rightAnswersNumber.value = resultResponse.data.result;
            correctness.value = resultResponse.data.correctness;

            page.value.setResult(result.value);
        };

        const validateAnswer = (index) => {
            if (correctness.value) {
                correctness.value[index] = null;
            }

            const isValidRange = (num, min, max) => {
                const numInt = parseInt(num);
                return numInt >= min && numInt <= max;
            };

            const answer = userAnswers.value[index];
            if (answer) {
                const cleanedAnswer = answer.replace(/\D/g, '');
                if (isValidRange(cleanedAnswer, 1, answerOptions.value.length)) {
                    userAnswers.value[index] = cleanedAnswer;
                    return;
                }
                const lastChar = cleanedAnswer.slice(-1);
                userAnswers.value[index] = (isValidRange(lastChar, 1, answerOptions.value.length)) ? lastChar : '';
            }
        };

        const classForInput = (index) => (correctness.value === null || correctness.value[index] === null)
            ? null : (correctness.value[index]) ? 'valid' : 'invalid';

        return {
            page,
            question,
            answerOptions,
            userAnswers,
            result,
            rightAnswers,
            rightAnswersNumber,
            explanation,
            userAnswersExtended,
            rightAnswersExtended,
            classForInput,
            checkAnswers,
            validateAnswer
        };
    }
};
</script>

<style lang="scss" scoped>
main {
  width: 50%;
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
    margin-bottom: 12px;
  }

  &__table {
    text-align: center;
    max-width: 50%;
    margin: 12px auto;
    border-spacing: 0;
    border-collapse: collapse;
  }
}

</style>