<template>
  <div class="discoverContainer">
    <nav-bar @clickBarItem="clickBarItem" :navBarItem="navBarData"></nav-bar>
    <router-view class="discover"></router-view>
  </div>
</template>

<script>
import NavBar from "components/navBar/NavBar";

export default {
  name: "Discover",
  components: {
    NavBar,
  },
  data() {
    return {
      navBarData: [
        { name: "个性推荐", path: "/discover/recommend" },
        { name: "歌单", path: "/discover/musiclist" },
        { name: "排行榜", path: "/discover/ranking" },
        { name: "歌手", path: "/discover/singer" },
      ],
    };
  },
  created() {},
  methods: {
    // 接收navbar传来的点击事件
    clickBarItem(path) {
      this.$router.push(path);
    },
  },
};
</script>

<style scoped>
.discoverContainer {
  overflow: hidden;
  padding: 0 !important;
}

.discover {
  /* max-width: 1000px; */
  margin: auto;
  overflow: scroll;
  height: calc(80vh - 157px);
  padding: 0 15px;
}
</style>