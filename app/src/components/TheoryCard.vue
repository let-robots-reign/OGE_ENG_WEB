<template>
    <div class="theory-card">
        <div class="theory-card__left">
            <img class="theory-card__image" :src="imageURL" :alt="title">
        </div>
        <div class="theory-card__center">{{ title }}</div>
    </div>
</template>

<script>
import {computed} from 'vue';

export default {
    name: 'TheoryCard',
    props: {
        image: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        }
    },
    setup() {
        const imageURL = computed(() => `/assets/img/${this.image}`);

        return {
            imageURL
        };
    }
};
</script>

<style scoped>
.theory-card {
    display: grid;
    grid-template-columns: 1fr 2fr;
    background-color: var(--light-blue-shadow);
    padding: 16px;
    border-radius: 24px;
    color: var(--primary-text-color);
    cursor: pointer;
    height: 120px;
}

.theory-card__center {
    margin-left: 16px;
    font-size: 18px;
    font-weight: bold;
}

</style>
