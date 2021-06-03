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
#app {
    min-height: 100vh;
    background-color: var(--dark-blue);
}
</style>
