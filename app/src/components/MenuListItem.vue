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
        // const itemClickLink = computed(() => `${props.baseClickLink}?topic=${props.title}`);
        console.log(`${props.baseClickLink}?topic=${props.title}`);
        const itemClickLink = computed(() => props.baseClickLink);
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

  &__title {
    font-size: 20px;
    font-weight: bold;
  }
}

</style>
