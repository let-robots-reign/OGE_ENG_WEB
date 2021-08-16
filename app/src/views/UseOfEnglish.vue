<template>
    <main>
        <AppTrainingPage :topic="topic" ref="page" @check-answers="checkAnswers">
            <template #training-instruction>
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
            </template>

            <template #training-content>
                <UseOfEnglishCard
                        v-for="(question, i) in questions"
                        :key="question._id"
                        :id="question._id"
                        :question="question.task"
                        :origin="question.origin"
                        :ref="el => { if (el) uoeCards[i] = el }"
                />
            </template>
        </AppTrainingPage>
    </main>
</template>

<script>
import UseOfEnglishCard from '@/components/cards/UseOfEnglishCard';
import {computed, onBeforeUpdate, onMounted, ref} from 'vue';
import {API} from '@/services/api';
import {replaceCharSequence} from '@/utils/replaceCharSequence';
import AppTrainingPage from '@/components/AppTrainingPage';

export default {
    name: 'UseOfEnglish',
    components: {AppTrainingPage, UseOfEnglishCard},
    props: {
        topic: {
            type: String
        }
    },
    setup(props) {
        const page = ref(null);
        const questions = ref([]);
        const uoeCards = ref([]);

        onMounted(async () => {
            API.getUoeTraining(props.topic)
                .then((res) => {
                    questions.value = res.data.questions;
                    page.value.setShowInstruction(true);
                })
                .catch((err) => console.log(err));
        });

        onBeforeUpdate(() => uoeCards.value = []);

        const rightAnswers = ref(null);
        const result = computed(() => {
            const resultRatio = (rightAnswers.value === null || questions.value === null) ? null :
                `${rightAnswers.value}/${questions.value.length}`;
            return `Ваш результат: ${resultRatio}`;
        });

        const checkAnswers = async () => {
            page.value.setIsChecking(true);

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

            page.value.setResult(result.value);
        };

        return {
            page,
            questions,
            uoeCards,
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
</style>
