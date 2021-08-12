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

        const getAnswerData = () => ({_id: props.id, answer: userAnswer.value});
        const setIsCorrect = (correct) => isCorrect.value = correct;
        const validity = computed(() => (isCorrect.value === null) ? null : (isCorrect.value) ? 'valid' : 'invalid');

        return {
            userAnswer,
            getAnswerData,
            isCorrect,
            setIsCorrect,
            validity
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