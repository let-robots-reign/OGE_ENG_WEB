<template>
    {{ message }}
</template>

<script>
import {API} from '@/api';
import {OK_CODE} from '@/api/codes';
import {useStore} from 'vuex';
import {onMounted, ref} from 'vue';

export default {
    name: 'MainPage',
    setup() {
        const message = ref('You are not logged in!');
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
