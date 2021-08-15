<template>
    <main>
        <teleport to="body">
            <app-modal v-if="showInstruction" title="Инструкция" @close="showInstruction = false">
                <div>
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
                    <button class="btn btn-block btn-centered primary" @click="showInstruction = false">ОК</button>
                </div>
            </app-modal>
        </teleport>

        <AppTrainingHeader :topic="topic" @show-instruction="showInstruction = true"/>

        <div class="card answer-options">
            <p class="answer-options__title">Вопросы</p>
            <p class="answer-options__option" v-for="option in slicedAnswerOptions" :key="option">{{ option }}</p>
        </div>

        <div class="card text-sections">
            <p class="text-sections__title">Тексты</p>
            <p class="text-sections__section" v-for="(section, index) in textSections" :key="index">
                <BaseSelect v-model="userAnswers[index]" :options="answerOptions"/>
                {{ section }}
            </p>
        </div>

        <div class="buttons-group">
            <button class="btn primary send-answers-btn" :disabled="isChecking"
                    v-if="!isChecked" @click="checkAnswers">
                Проверить
            </button>
            <button class="btn secondary" @click="$router.go(-1)">Выход</button>
        </div>

        <teleport to="body">
            <app-modal v-if="showResult" :title="result" @close="showResult = false">
                <div>
                    <p>Вы можете посмотреть свои ошибки и правильные ответы</p>
                    <button class="btn btn-block btn-centered primary" @click="showResult = false">ОК</button>
                </div>
            </app-modal>
        </teleport>
    </main>
</template>

<script>
import AppTrainingHeader from '@/components/AppTrainingHeader';
import {computed, onMounted, ref, watch} from 'vue';
import AppModal from '@/components/AppModal';
import {API} from '@/services/api';
import BaseSelect from '@/components/form/BaseSelect';

export default {
    name: 'Reading',
    components: {BaseSelect, AppTrainingHeader, AppModal},
    props: {
        topic: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const question = ref({});
        const showInstruction = ref(false);
        const userAnswers = ref([]);

        onMounted(async () => {
            API.getReadingTraining(props.topic)
                .then((res) => {
                    question.value = res.data.question;
                    showInstruction.value = true;
                })
                .catch((err) => console.log(err));
        });

        const textSections = computed(() => question.value.text?.split('\r\n'));
        const answerOptions = computed(() => question.value.task?.split('\r\n'));
        const slicedAnswerOptions = computed(() => (answerOptions.value) ? answerOptions.value.slice(1) : []);

        watch(answerOptions, (newV) => userAnswers.value = Array(newV.length - 2).fill(newV[0]));

        const isChecking = ref(false);
        const isChecked = ref(false);
        const showResult = ref(false);
        // const rightAnswers = ref(null);
        const result = computed(() => {
            const resultRatio = '0/10';
            // const resultRatio = (rightAnswers.value === null || question.value === null) ? null :
            //     `${rightAnswers.value}/${userAnswers.value.length}`;
            return `Ваш результат: ${resultRatio}`;
        });

        const checkAnswers = async () => {
            isChecking.value = true;



            isChecking.value = false;
            isChecked.value = true;
            showResult.value = true;
        };

        return {
            question,
            textSections,
            answerOptions,
            slicedAnswerOptions,
            userAnswers,
            showInstruction,
            isChecking,
            isChecked,
            result,
            showResult,
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

.buttons-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;

  button {
    width: 100%;
    height: 50px;
    border-radius: 8px;
    font-size: 18px;
    font-family: Inter, Roboto, Oxygen, Fira Sans, Helvetica Neue, sans-serif;
  }
}
</style>