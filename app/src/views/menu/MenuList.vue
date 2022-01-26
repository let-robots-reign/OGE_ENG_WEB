<template>
    <div class="menu">
        <AppBackFloatingButton/>

        <div class="menu__list">
            <MenuListItem
                    v-for="(title, index) in titles"
                    :key="index"
                    :title="title"
                    :base-click-link="baseClickLink"
            />
        </div>
    </div>
</template>

<script>
import MenuListItem from '@/components/menu/MenuListItem';
import AppBackFloatingButton from '@/components/base/AppBackFloatingButton';

export default {
    name: 'MenuList',
    components: {AppBackFloatingButton, MenuListItem},
    props: {
        titles: {
            type: Array,
            required: true
        },
        baseClickLink: {
            type: String,
            required: true
        }
    }
};
</script>

<style lang="scss" scoped>
.menu {
  flex-grow: 0;
  margin: 32px auto;

  &__list {
    width: 500px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0 auto 20px auto;
  }
}

@media screen and (max-width: 512px) {
  .menu {
    flex-grow: 1;

    &__list {
      width: 100%;
    }
  }
}
</style>
