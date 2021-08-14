<template>
    <main v-if="questions.length">
        <teleport to="body">
            <app-modal v-if="showInstruction" title="Инструкция" @close="showInstruction = false">
                <div>
                    <p>
                        Преобразуйте слова, напечатанные заглавными буквами так, чтобы они грамматически и лексически
                        соответствовали содержанию текстов.
                    </p>
                    <p>
                        Заполните пропуски полученными словами.
                    </p>
                    <p>
                        Слова вводите заглавными буквами, без пробелов, как в экзаменационном бланке.
                    </p>
                    <p>
                        Глагольные формы вводите без сокращений.
                    </p>
                    <button class="btn btn-block btn-centered primary" @click="showInstruction = false">ОК</button>
                </div>
            </app-modal>
        </teleport>

        <div>
            <AppBackFloatingButton/>

            <div class="card training-header">
                <p class="training-header__title">{{ topic }}</p>
                <button class="btn primary" @click="showInstruction = true">Инструкция</button>
            </div>
        </div>

        <UseOfEnglishCard
                v-for="(question, i) in questions"
                :key="question._id"
                :id="question._id"
                :question="question.task"
                :origin="question.origin"
                :ref="el => { if (el) uoeCards[i] = el }"
        />
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
import UseOfEnglishCard from '@/components/cards/UseOfEnglishCard';
import {computed, onBeforeUpdate, onMounted, ref} from 'vue';
import {API} from '@/services/api';
import {replaceCharSequence} from '@/utils/replaceCharSequence';
import AppModal from '@/components/AppModal';
import AppBackFloatingButton from '@/components/AppBackFloatingButton';

export default {
    name: 'UseOfEnglish',
    components: {AppBackFloatingButton, UseOfEnglishCard, AppModal},
    props: {
        topic: {
            type: String,
        }
    },
    setup(props) {
        const questions = ref([]);
        const uoeCards = ref([]);
        const showInstruction = ref(false);

        onMounted(async () => {
            API.getUoeTraining(props.topic)
                .then((res) => {
                    questions.value = res.data.questions;
                    showInstruction.value = true;
                })
                .catch((err) => console.log(err));
        });

        onBeforeUpdate(() => uoeCards.value = []);

        const isChecking = ref(false);
        const isChecked = ref(false);
        const showResult = ref(false);
        const rightAnswers = ref(null);
        const result = computed(() => {
            const resultRatio = (rightAnswers.value === null || questions.value === null) ? null :
                `${rightAnswers.value}/${questions.value.length}`;
            return `Ваш результат: ${resultRatio}`;
        });

        const checkAnswers = async () => {
            isChecking.value = true;

            const userAnswers = uoeCards.value.map((cardComponent) => cardComponent.getAnswerData());
            const checkResultResponse = await API.checkTraining('use-of-english', userAnswers);
            const checkResult = checkResultResponse.data.correctness;
            rightAnswers.value = checkResultResponse.data.rightAnswers;

            uoeCards.value.forEach((cardComponent, index) => {
                const givenAnswer = userAnswers[index].answer;
                const rightAnswer = checkResult.find((el) => el._id === userAnswers[index]._id).rightAnswer;
                cardComponent.setIsCorrect(givenAnswer === rightAnswer);
                const relevantQuestion = questions.value.find((question) => question._id === userAnswers[index]._id);
                relevantQuestion.task = replaceCharSequence(relevantQuestion.task, '_',
                    rightAnswer, {tagWrapper: 'strong'});
            });

            isChecking.value = false;
            isChecked.value = true;
            showResult.value = true;
        };

        return {
            questions,
            uoeCards,
            isChecking,
            isChecked,
            result,
            showResult,
            showInstruction,
            checkAnswers
        };
    }
};
</script>

<style lang="scss" scoped>
@import '@/variables';

main {
  width: 50%;
  margin: 32px auto;
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


<style lang="scss" scoped>
::v-deep .modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep .modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 90%;
  margin: 0 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  background: #fff;
  gap: 16px;
}

.modal {
  &__title {
    margin: 0 2rem 0 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  &__content {
    flex-grow: 1;
    overflow-y: auto;
  }

  &__action {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    padding: 1rem 0 0;
  }

  &__close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }
}

</style>
