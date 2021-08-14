<template>
    <div class="back-button" @click="$router.go(-1)">
        &lt;-
    </div>
</template>

<script>
export default {
    name: 'AppBackFloatingButton'
};
</script>

<style lang="scss" scoped>
.back-button {
  position: fixed;
  width: 80px;
  height: 80px;
  line-height: 80px;
  margin-right: 12px;
  background-color: #fff;
  color: #000;
  transform: translateX(-150%);
  border-radius: 50px;
  text-align: center;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.2);
  font-size: 40px;
  font-weight: 700;

  &:hover {
    cursor: pointer;
    background-color: #ccc;
  }
}
</style>