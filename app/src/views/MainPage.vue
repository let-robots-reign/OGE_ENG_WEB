<template>
    {{ message }}
</template>

<script>
import {API} from '@/api';
import {OK_CODE} from '@/api/codes';
import {useStore} from 'vuex';

export default {
    name: 'MainPage',
    data() {
        return {
            message: 'Not logged in'
        };
    },
    beforeMount() {
        const store = useStore();
        API.getCurrentUser()
            .then(async (response) => {
                if (response.status === OK_CODE) {
                    this.message = `Hi, ${response.data.name}`;
                    await store.dispatch('setAuth', true);
                }
            })
            .catch(async () => {
                await store.dispatch('setAuth', false);
            });
    }
};
</script>

<style scoped>

</style>
