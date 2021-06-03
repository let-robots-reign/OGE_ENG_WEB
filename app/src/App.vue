<template>
    <Navbar/>

    <router-view/>
</template>

<style>
@import 'variables.css';
</style>

<script>
import Navbar from '@/components/Navbar';
export default {
    components: {Navbar}
};
</script>
