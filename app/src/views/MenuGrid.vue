<template>
    <div class="menu">
        <AppBackFloatingButton/>

        <div class="menu__grid">
            <MenuGridItem v-for="(title, index) in gridItems" :text="title" :key="index"/>
        </div>
    </div>
</template>

<script>
import MenuGridItem from '@/components/MenuGridItem';
import AppBackFloatingButton from '@/components/AppBackFloatingButton';

export default {
    name: 'MenuGrid',
    components: {AppBackFloatingButton, MenuGridItem},
    props: {
        gridItems: {
            type: Array,
            required: true
        }
    }
};
</script>

<style scoped>

.menu {
    max-width: 50%;
    margin: 32px auto;
}

.menu__grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
}
</style>
