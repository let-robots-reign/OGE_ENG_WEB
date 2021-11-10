<template>
    <AppBackFloatingButton/>

    <div class="card training-header">
        <p class="training-header__title">{{ topic }}</p>
        <button class="btn primary" @click="$emit('show-instruction')">Инструкция</button>
    </div>
</template>

<script>
import AppBackFloatingButton from '@/components/AppBackFloatingButton';

export default {
    name: 'AppTrainingHeader',
    emits: ['show-instruction'],
    components: {AppBackFloatingButton},
    props: {
        topic: {
            type: String,
            required: true
        }
    }
};
</script>

<style lang="scss" scoped>
.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  position: relative;

  &__title {
    font-size: 2rem;
    font-weight: 700;
  }
}

@media screen and (max-width: 676px){
  .training-header {
    flex-direction: column;
    word-break: break-word;
    gap: 12px;

    &__title {
      font-size: 1.3rem;
    }
  }
}
</style>