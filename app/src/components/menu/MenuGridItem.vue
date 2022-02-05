<template>
  <div class="card menu-list-item">
    <p class="menu-list-item__text">{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: 'MenuGridItem',
  props: {
    text: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/variables';

.menu-list-item {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 120px;
  cursor: pointer;

  &:hover {
    .menu-list-item__text {
      color: $green-accent;
    }
  }

  &__text {
    font-size: 20px;
  }
}

</style>
