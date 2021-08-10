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

<style>
@import 'variables.css';
html {
    position: relative;
    min-height: 100%;
}

body {
    margin-bottom: var(--footer-height);
}

#app {
    min-height: calc(100vh - var(--footer-height));
    background-color: var(--dark-blue);
}
</style>
