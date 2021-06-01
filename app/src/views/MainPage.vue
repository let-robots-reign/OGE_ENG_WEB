<template>
    Главная
    {{ message }}
</template>

<script>
import {onMounted, ref} from 'vue';
import {API} from '@/api';
import {OK_CODE} from '@/api/codes';
import {useStore} from 'vuex';

export default {
    name: 'MainPage',
    setup() {
        const message = ref('Not logged in');
        const store = useStore();

        onMounted(async () => {
            API.getCurrentUser()
                .then(async (response) => {
                    if (response.status === OK_CODE) {
                        message.value = `Hi, ${response.data.name}`;
                        await store.dispatch('setAuth', true);
                    }
                })
                .catch(async () => {
                    await store.dispatch('setAuth', false);
                });
        });

        return {
            message
        };
    }
};
</script>

<style scoped>

</style>
