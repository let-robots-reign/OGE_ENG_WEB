<template>
    <div class="menu">
        <AppBackFloatingButton/>

        <div class="menu__grid">
            <router-link
                    v-for="item in gridItems"
                    :key="item._id"
                    :to="{ name: 'Theory Article', params: { id: item._id } }"
            >
                <MenuGridItem :text="item.title"  />
            </router-link>
        </div>
    </div>
</template>

<script>
import MenuGridItem from '@/components/menu/MenuGridItem';
import AppBackFloatingButton from '@/components/base/AppBackFloatingButton';
import {API} from '@/services/api';
import {ref} from 'vue';

export default {
    name: 'MenuGrid',
    components: {AppBackFloatingButton, MenuGridItem},
    props: {
        category: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const gridItems = ref([]);
        API.getTheoryArticlesByCategory(props.category)
            .then((res) => gridItems.value = res.data.items)
            .catch((err) => console.log(err));

        return {gridItems};
    },
};
</script>

<style scoped>

.menu {
    flex-grow: 1;
    margin: 32px auto;
}

.menu__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
}
</style>
