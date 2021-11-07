<template>
    <the-navbar></the-navbar>
    <router-view/>
    <the-footer></the-footer>
</template>

<script>
import TheNavbar from '@/components/TheNavbar';
import TheFooter from '@/components/TheFooter';
import {useStore} from 'vuex';
import {onMounted} from 'vue';
import {API} from '@/services/api';

export default {
    components: {TheFooter, TheNavbar},
    setup() {
        const store = useStore();
        onMounted(() => {
            API.getCurrentUser()
                .then((res) => store.commit('auth/setUser', res.data))
                .catch(() => store.commit('auth/setUser', null));
        });
    }
};
</script>

<style lang="scss">
@import 'theme';
@import 'variables';

#app {
  min-height: calc(100vh - #{$footer-height} - #{$app-padding-bottom});
  padding-bottom: $app-padding-bottom;
}

</style>
