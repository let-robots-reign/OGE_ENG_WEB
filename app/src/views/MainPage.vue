<template>
    {{ message }}
</template>

<script>
import {API} from '@/services/api';
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
                    message.value = `Hi, ${response.data.name}`;
                    await store.dispatch('setAuth', true);
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
