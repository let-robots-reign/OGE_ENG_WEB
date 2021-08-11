<template>
    <footer class="footer">
        <div class="container">
            <ul class="footer-links">
                <li class="footer-link">
                    <router-link :to="{ name: 'Main Page' }">ОГЭ Английский (2021) &copy;</router-link>
                </li>
                <li class="footer-link">
                    <router-link :to="{ name: 'Main Page' }">О проекте</router-link>
                </li>
                <li class="footer-link">
                    <router-link :to="{ name: 'Main Page' }">Контакты</router-link>
                </li>
            </ul>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'TheFooter'
};
</script>

<style lang="scss" scoped>
@import '@/variables';

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: $footer-height; /* Fixed height of the footer here */
  line-height: 60px; /* Vertically center the text there */
  background-color: $white;
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
