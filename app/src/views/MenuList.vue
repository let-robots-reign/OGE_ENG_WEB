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
import MenuListItem from '@/components/MenuListItem';
import AppBackFloatingButton from '@/components/AppBackFloatingButton';

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

<style scoped>
.menu {
    width: 30%;
    margin: 32px auto;
}

.menu__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
}
</style>
