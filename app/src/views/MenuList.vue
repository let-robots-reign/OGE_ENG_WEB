<template>
    <div class="menu">
        <div class="menu__list">
            <MenuListItem v-for="(title, index) in titles" :key="index" :title="title"/>
        </div>
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

.back-link {
    display: block;
    text-decoration: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding-bottom: 32px;
}
</style>
