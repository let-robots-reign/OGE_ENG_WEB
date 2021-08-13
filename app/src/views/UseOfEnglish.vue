<template>
    <main v-if="questions.length">
        <UseOfEnglishCard
                v-for="(question, i) in questions"
                :key="question._id"
                :id="question._id"
                v-model:question="question.task"
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
    </main>
</template>

<script>
import UseOfEnglishCard from '@/components/cards/UseOfEnglishCard';
import {computed, onBeforeUpdate, onMounted, ref} from 'vue';
import {API} from '@/services/api';
import {replaceCharSequence} from '@/utils/replaceCharSequence';

export default {
    name: 'UseOfEnglish',
    components: {UseOfEnglishCard},
    props: {
        topic: {
            type: String,
        }
    },
    setup(props) {
        const questions = ref([]);
        const uoeCards = ref([]);

        onMounted(async () => {
            API.getUoeTraining(props.topic)
                .then((res) => {
                    questions.value = res.data.questions;
                })
                .catch((err) => console.log(err));
        });

        onBeforeUpdate(() => uoeCards.value = []);

        const isChecking = ref(false);
        const isChecked = ref(false);
        const rightAnswers = ref(null);
        const result = computed(() => (rightAnswers.value === null || questions.value === null)
            ? null : `${rightAnswers.value}/${questions.value.length}`);

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
        };

        return {
            questions,
            uoeCards,
            isChecking,
            isChecked,
            result,
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