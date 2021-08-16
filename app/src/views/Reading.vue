<template>
    <main>
        <AppTrainingPage :topic="topic" ref="page" @check-answers="checkAnswers">
            <template #training-instruction>
                <p>
                    Определите, в каком из текстов <strong>A-F</strong> содержатся ответы на вопросы
                    <strong>1-7</strong>.
                </p>
                <p>
                    Используйте каждую цифру только один раз.
                </p>
                <p>
                    В задании есть один лишний вопрос.
                </p>
            </template>

            <template #training-content>
                <div class="card answer-options">
                    <p class="answer-options__title">Вопросы</p>
                    <p class="answer-options__option"
                       v-for="option in slicedAnswerOptions"
                       :key="option">{{ option }}</p>
                </div>

                <div class="card text-sections">
                    <p class="text-sections__title">Тексты</p>
                    <p class="text-sections__section" v-for="(section, index) in textSections" :key="index">
                        <BaseSelect
                                :class="classForSelect(index)"
                                v-model="userAnswers[index]"
                                :options="answerOptions"
                                @change="resetCorrectness(index)"
                        />
                        {{ section }}
                    </p>
                </div>
            </template>
        </AppTrainingPage>
    </main>
</template>

<script>
import {computed, onMounted, ref} from 'vue';
import {API} from '@/services/api';
import BaseSelect from '@/components/form/BaseSelect';
import AppTrainingPage from '@/components/AppTrainingPage';

export default {
    name: 'Reading',
    components: {AppTrainingPage, BaseSelect},
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
            API.getReadingTraining(props.topic)
                .then((res) => {
                    question.value = res.data.question;
                    userAnswers.value = Array(answerOptions.value.length - 2).fill(answerOptions.value[0]);
                    page.value.setShowInstruction(true);
                })
                .catch((err) => console.log(err));
        });

        const textSections = computed(() => question.value.text?.split('\r\n'));
        const answerOptions = computed(() => question.value.task?.split('\r\n'));
        const slicedAnswerOptions = computed(() => (answerOptions.value) ? answerOptions.value.slice(1) : []);

        const rightAnswers = ref(null);
        const correctness = ref(null);
        const result = computed(() => {
            const resultRatio = (correctness.value === null || question.value === null) ? null :
                `${correctness.value.filter(Boolean).length}/${correctness.value.length}`;
            return `Ваш результат: ${resultRatio}`;
        });

        const checkAnswers = async () => {
            page.value.setIsChecking(true);

            const answers = userAnswers.value.map((answer) => answerOptions.value.indexOf(answer));
            const payload = {_id: question.value._id, answers};
            const resultResponse = await API.checkTraining('reading', payload);
            rightAnswers.value = resultResponse.data.rightAnswers;
            correctness.value = resultResponse.data.correctness;

            page.value.setResult(result.value);
        };

        const classForSelect = (index) => (correctness.value === null || correctness.value[index] === null)
            ? null : (correctness.value[index]) ? 'valid' : 'invalid';
        const resetCorrectness = (index) => {
            if (correctness.value) {
                correctness.value[index] = null;
            }
        };

        return {
            page,
            question,
            textSections,
            answerOptions,
            slicedAnswerOptions,
            userAnswers,
            result,
            correctness,
            classForSelect,
            resetCorrectness,
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

.answer-options, .text-sections {
  padding: 1.5rem;

  &__title {
    font-size: 1.7rem;
    font-weight: 700;
    margin-bottom: 12px;
  }

  &__option {
    font-size: 18px;
  }
}

.text-sections {
  &__section {
    font-size: 20px;
    margin-bottom: 20px;
  }
}
</style>