<template>
    <main>
        <AppBackFloatingButton/>

        <div class="card">
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
        const route = useRoute();

        API.getTheoryArticleContent(route.params.id)
            .then((res) => htmlContent.value = res.data.content)
            .catch((err) => console.log(err));

        return {htmlContent};
    },
};
</script>

<style lang="scss" scoped>
main {
  width: 50%;
  margin: 32px auto;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;


}
</style>