<template>
    <Navbar/>
    <router-view/>
    <Footer/>
</template>

<script>
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export default {
    components: {Footer, Navbar}
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
