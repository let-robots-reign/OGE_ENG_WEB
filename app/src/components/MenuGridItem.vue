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
            required: true,
        }
    }
};
</script>

<style lang="scss" scoped>

.menu-list-item {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100px;
  cursor: pointer;

  &:hover {
    .menu-list-item__text {
      color: var(--green-accent);
    }
  }

  &__text {
    font-size: 20px;
  }
}

</style>
