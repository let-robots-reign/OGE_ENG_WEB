<template>
    <div class="card theory-card">
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
    setup(props) {
        const imageURL = computed(() => `/assets/img/${props.image}`);

        return {
            imageURL
        };
    }
};
</script>

<style lang="scss" scoped>
.theory-card {
  display: grid;
  grid-template-columns: 1fr 2fr;
  color: var(--primary-text-color);
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 2px 2px var(--green-accent) inset;
  }

  &__center {
    margin-left: 16px;
    font-size: 18px;
    font-weight: bold;
  }
}

</style>
