<template>
<div class="menu-list">
    <MenuListItem v-for="(title, index) in titles" :key="index" :title="title"/>
    <a class="back-link" @click="$router.go(-1)">&lt;- назад</a>
</div>
</template>

<script>
import MenuListItem from '@/components/MenuListItem';
export default {
    name: 'MenuList',
    components: {MenuListItem},
    props: {
        titles: {
            type: Array,
            required: true,
        }
    }
};
</script>

<style scoped>
.menu-list {
    width: 30%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 32px auto;
}

.back-link {
    text-decoration: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
}
</style>
