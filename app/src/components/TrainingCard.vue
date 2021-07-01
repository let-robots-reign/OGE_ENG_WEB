<template>
    <div class="training-card">
        <div class="training-card__left">
            <img class="training-card__image" :src="imageURL">
        </div>
        <div class="training-card__center">{{ title }}</div>
        <div class="training-card__progress" v-if="progress">{{ progressPercent }}</div>
    </div>
</template>

<script>
export default {
    name: 'TrainingCard',
    props: {
        image: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        progress: {
            type: Number,
            required: false,
            default: null,
        }
    },
    computed: {
        imageURL: function() {
            return `/assets/img/${this.image}`;
        },
        progressPercent: function() {
            return `прогресс: ${this.progress}%`;
        }
    }
};
</script>

<style scoped>
.training-card {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 2fr;
    background-color: var(--light-blue-shadow);
    padding: 16px;
    border-radius: 24px;
    color: var(--primary-text-color);
    cursor: pointer;
}

.training-card__center {
    margin-left: 16px;
    font-size: 20px;
    font-weight: bold;
}

.training-card__progress {
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 16px;
    padding: 12px;
}

</style>
