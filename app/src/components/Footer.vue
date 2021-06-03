<template>
    <footer class="footer">
        <div class="container">
            <p class="footer-text">Place sticky footer content here.</p>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'Footer'
};
</script>

<style scoped>
.footer {
    position: absolute;
    bottom: 0;
    color: var(--light-blue-shadow);
    width: 100%;
    height: var(--footer-height);  /* Fixed height of the footer here */
    line-height: 60px; /* Vertically center the text there */
    background-color: var(--lighter-blue);
}
</style>
