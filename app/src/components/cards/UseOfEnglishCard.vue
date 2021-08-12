<template>
    <div class="card uoe-card">
        <div class="uoe-card__question">{{ question }}</div>
        <BaseInput
                class="uoe-card__input"
                :class="validity"
                type="text"
                :placeholder="origin"
                v-model="userAnswer"
        />
    </div>
</template>

<script>
import BaseInput from '@/components/form/BaseInput';
import {computed, ref} from 'vue';
import {replaceCharSequence} from '@/utils/replaceCharSequence';

export default {
    name: 'UseOfEnglishCard',
    components: {BaseInput},
    props: {
        id: {
            type: String,
            required: true
        },
        question: {
            type: String,
            required: true
        },
        origin: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const userAnswer = ref('');
        const isCorrect = ref(null);

        const validity = computed(() => (isCorrect.value === null) ? null : (isCorrect.value) ? 'valid' : 'invalid');

        const getAnswerData = () => ({_id: props.id, answer: userAnswer.value});
        const setIsCorrect = (correct) => isCorrect.value = correct;
        const displayRightAnswer = (rightAnswer) => console.log(replaceCharSequence(props.question, '_', rightAnswer));

        return {
            userAnswer,
            getAnswerData,
            isCorrect,
            setIsCorrect,
            validity,
            displayRightAnswer
        };
    }
};
</script>

<style lang="scss" scoped>
.uoe-card {
  margin: 24px auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;

  &__question {
    font-size: 18px;
  }
}
</style>