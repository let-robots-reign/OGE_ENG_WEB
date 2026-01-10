<template>
  <router-link :to="itemClickLink">
    <div class="card menu-item">
      <p class="menu-item__title">{{ title }}</p>
    </div>
  </router-link>
</template>

<script>
import {computed} from 'vue';

export default {
  name: 'MenuListItem',
  props: {
    title: {
      type: String,
      required: true
    },
    baseClickLink: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const itemClickLink = computed(() =>
      `${props.baseClickLink}?${new URLSearchParams({topic: props.title}).toString()}`);
    return {
      itemClickLink
    };
  }
};
</script>

<style lang="scss" scoped>
@import '@/variables';

.menu-item {
  color: $primary-text-color;
  cursor: pointer;
  padding: 2rem;
  margin-bottom: 0;

  &__title {
    font-size: 24px;
    font-weight: bold;
  }
}

</style>
