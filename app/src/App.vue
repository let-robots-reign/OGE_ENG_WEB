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

img {
  display: block;
  max-width: 100%;
  height: auto;
}

.card {
  overflow: hidden;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 16px;
  box-shadow: 2px 3px 10px rgba(0, 0, 0, 0.2);
  background: #fff;
}

.card.marked {
  border: 4px solid #42b983;
}

.card.center {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
