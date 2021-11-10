<template>
    <main>
        <AppBackFloatingButton/>

        <div class="card">
            <router-link
                    :to="{ name: 'Create Theory',
                    params: { isEditing: true, articleID: $route.params.id, initialContent: htmlContent,
                              articleCategory: category }}"
                    class="edit-link"
                    v-if="$store.getters['auth/role'] === 'admin'"
            >
                <span>Редактировать</span>
                <font-awesome-icon :icon="['fas', 'edit']" class="edit-link__icon"/>
            </router-link>
            <div class="card-content" v-html="htmlContent"></div>
        </div>
    </main>
</template>

<script>
import {API} from '@/services/api';
import {ref} from 'vue';
import {useRoute} from 'vue-router';
import AppBackFloatingButton from '@/components/AppBackFloatingButton';

export default {
    name: 'TheoryArticle',
    components: {AppBackFloatingButton},
    setup() {
        const htmlContent = ref('');
        const category = ref('');
        const route = useRoute();

        API.getTheoryArticleContent(route.params.id)
            .then((res) => {
                htmlContent.value = res.data.content;
                category.value = res.data.category;
            })
            .catch((err) => console.log(err));

        return {htmlContent, category};
    },
};
</script>

<style lang="scss" scoped>
main {
  flex-grow: 1;
  margin: 32px auto;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edit-link {
  display: flex;
  justify-content: right;
  align-items: center;
  gap: 12px;
  font-size: 16px;

  &__icon {
    width: 20px;
    height: 20px;
  }
}
</style>