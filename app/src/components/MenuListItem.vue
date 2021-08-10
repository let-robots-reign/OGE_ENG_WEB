<template>
    <div class="card menu-item">
        <p class="menu-item__title">{{ title }}</p>
    </div>
</template>

<script>
export default {
    name: 'MenuListItem',
    props: {
        title: {
            type: String,
            default: '',
            required: true,
        }
    }
};
</script>

<style lang="scss" scoped>
.menu-item {
  color: var(--primary-text-color);
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 2px 2px var(--green-accent) inset;
  }

  &__title {
    font-size: 20px;
    font-weight: bold;
  }
}

</style>
