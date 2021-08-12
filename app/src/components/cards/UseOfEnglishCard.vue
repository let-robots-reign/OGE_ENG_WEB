<template>
    <div class="card uoe-card">
        <div class="uoe-card__question">{{ question }}</div>
        <BaseInput class="uoe-card__input" type="text" :placeholder="origin" v-model="userAnswer"/>
    </div>
</template>

<script>
import BaseInput from '@/components/form/BaseInput';
import {ref} from 'vue';

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

        const getAnswerData = () => ({id: props.id, userAnswer: userAnswer.value});

        return {
            userAnswer,
            getAnswerData
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