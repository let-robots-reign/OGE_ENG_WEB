<template>
    <div class="card training-card">
        <div class="training-card__left">
            <img class="training-card__image" :src="imageURL" :alt="title">
        </div>
        <div class="training-card__center">{{ title }}</div>
        <div class="training-card__progress" v-if="progress">{{ progressPercent }}</div>
    </div>
</template>

<script>
import {computed} from 'vue';

export default {
    name: 'TrainingCard',
    props: {
        image: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        progress: {
            type: Number,
            required: false,
            default: null
        }
    },
    setup(props) {
        const imageURL = computed(() => `/assets/img/${props.image}`);
        const progressPercent = computed(() => `прогресс: ${props.progress}%`);

        return {
            imageURL,
            progressPercent
        };
    }
};
</script>

<style lang="scss" scoped>
@import '@/variables';

.training-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 2fr;
  color: $primary-text-color;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 2px 2px $green-accent inset;
  }

  &__center {
    margin-left: 16px;
    font-size: 20px;
    font-weight: bold;
  }

  &__progress {
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 16px;
    padding: 12px;
  }
}

</style>
