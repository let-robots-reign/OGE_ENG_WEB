<template>
  <div class="card uoe-card">
    <!-- v-html to support user-defined tags like <strong> -->
    <div class="uoe-card__question" v-html="question"></div>
    <BaseInput
      class="uoe-card__input"
      :class="validity"
      type="text"
      :placeholder="origin"
      v-model="userAnswer"
      @input="isCorrect = null"
    />
  </div>
</template>

<script>
import BaseInput from '@/components/form/BaseInput';
import {computed, ref, watch} from 'vue';

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

    watch(userAnswer, (newV) => userAnswer.value = newV.toUpperCase().replace(' ', ''));

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
    min-width: 100%;
    width: 0;
  }
}
</style>