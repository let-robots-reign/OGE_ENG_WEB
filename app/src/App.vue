<template>
    <the-navbar></the-navbar>
    <router-view/>
    <the-footer></the-footer>
</template>

<script>
import TheNavbar from '@/components/TheNavbar';
import TheFooter from '@/components/TheFooter';

export default {
    components: {TheFooter, TheNavbar}
};
</script>

<style lang="scss">
@import 'theme';
@import 'variables';

#app {
  min-height: calc(100vh - #{$footer-height});
}

</style>
