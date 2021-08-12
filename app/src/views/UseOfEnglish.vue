<template>
    <main v-if="questions.length">
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
                    @click="checkAnswers">Проверить
            </button>
            <button class="btn secondary" @click="$router.go(-1)">Выход</button>
        </div>
    </main>
</template>

<script>
import UseOfEnglishCard from '@/components/cards/UseOfEnglishCard';
import {onBeforeUpdate, onMounted, ref} from 'vue';
import {API} from '@/services/api';

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
        const checkAnswers = async () => {
            isChecking.value = true;
            const userAnswers = uoeCards.value.map((cardComponent) => cardComponent.getAnswerData());
            const checkResult = await API.checkTraining('use-of-english', userAnswers);
            console.log(checkResult);
            isChecking.value = false;
        };

        return {
            questions,
            uoeCards,
            isChecking,
            checkAnswers
        };
    }
};
</script>

<style lang="scss" scoped>
@import '@/variables';

main {
  width: 50%;
  margin: 0 auto;
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