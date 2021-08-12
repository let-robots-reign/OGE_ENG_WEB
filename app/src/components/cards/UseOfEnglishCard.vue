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
        question: {
            type: String,
            required: true
        },
        origin: {
            type: String,
            required: true
        }
    },
    setup() {
        const userAnswer = ref('');

        return {
            userAnswer
        };
    }
};
</script>

<style lang="scss" scoped>
.uoe-card {
  max-width: 50%;
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