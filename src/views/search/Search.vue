<template>
  <div class="search">
    <!-- navbar -->
    <nav-bar @clickBarItem="clickBarItem" :navBarItem="navBarData"></nav-bar>
    <div class="title"></div>
    <router-view></router-view>
  </div>
</template>

<script>
import NavBar from "components/navBar/NavBar.vue";
export default {
  name: "Search",
  components: {
    NavBar,
  },
  data() {
    return {
      navBarData: [
        {
          name: "单曲",
          path: `/search/searchsong/${this.$route.params.id}`,
        },
        {
          name: "歌手",
          path: `/search/searchsinger/${this.$route.params.id}`,
        },
        {
          name: "专辑",
          path: `/search/searchalbum/${this.$route.params.id}`,
        },
        {
          name: "视频",
          path: `/search/searchvideo/${this.$route.params.id}`,
        },
        {
          name: "歌单",
          path: `/search/searchmusiclist/${this.$route.params.id}`,
        },
      ],
    };
  },
  methods: {
    //   请求
    // 获取搜索结果

    // 事件响应
    //   点击navbar的回调
    clickBarItem(path) {
      //   console.log(path);
      if (path != this.$route.path) {
        this.$router.push(path);
      }
    },
  },
};
</script>

<style scoped>
</style>