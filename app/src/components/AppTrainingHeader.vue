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

<style scoped>

</style>