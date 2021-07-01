<template>
    <div class="menu">
        <div class="menu__grid">
            <MenuGridItem v-for="(title, index) in gridItems" :text="title" :key="index"/>
        </div>
        <a class="back-link" @click="$router.go(-1)">&lt;- назад</a>
    </div>
</template>

<script>
import MenuGridItem from '@/components/MenuGridItem';

export default {
    name: 'MenuGrid',
    components: {MenuGridItem},
    props: {
        gridItems: {
            type: Array,
            required: true,
        }
    }
};
</script>

<style scoped>

.menu {
    width: 30%;
    margin: 32px auto;
}

.menu__grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
}

.back-link {
    text-decoration: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
}

</style>
