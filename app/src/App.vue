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
@import 'variables.css';

* {
  margin: 0;
}

html {
  position: relative;
  min-height: 100%;
}

body {
  font-family: Inter, Roboto, Oxygen, Fira Sans, Helvetica Neue, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  background: var(--dark-blue);
  margin-bottom: var(--footer-height);
}

#app {
  min-height: calc(100vh - var(--footer-height));
}

a {
  text-decoration: none;
  color: var(--primary-text-color);

  &:hover {
    color: var(--primary-text-color);
    text-decoration: underline;
    text-decoration-color: var(--green-accent);
    text-underline-offset: 4px;
  }
}
</style>
