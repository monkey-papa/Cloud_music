<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    this.$message.success('欢迎来到Monkey-PaPa的PC端云音乐~~')
  },
}
</script>

<style></style>
