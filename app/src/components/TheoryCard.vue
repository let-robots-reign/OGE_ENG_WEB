<template>
    <div class="theory-card">
        <div class="theory-card__left">
            <img class="theory-card__image" :src="imageURL">
        </div>
        <div class="theory-card__center">{{ title }}</div>
    </div>
</template>

<script>
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
    computed: {
        imageURL: function() {
            return `/assets/img/${this.image}`;
        }
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
    font-size: 20px;
    font-weight: bold;
}

</style>
