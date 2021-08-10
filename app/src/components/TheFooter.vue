<template>
    <footer class="footer">
        <div class="container">
            <ul class="footer-links">
                <li class="footer-link">ОГЭ Английский (2021) &copy;</li>
                <li class="footer-link">О проекте</li>
                <li class="footer-link">Контакты</li>
            </ul>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'TheFooter'
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

.footer-links {
    list-style-type: none;
}

.footer-link {
    display: inline;
    margin-right: 32px;
    cursor: pointer;
}
</style>
