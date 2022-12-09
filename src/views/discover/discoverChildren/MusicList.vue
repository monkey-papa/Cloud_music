<template>
  <div class="musicListContainer">
    <div class="musicList">
      <!-- 歌单出口 -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: "MusicList",
};
</script>

<style scoped>
.musicListContainer {
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #16181c;
}

.musicList {
  max-width: 1000px;
  padding: 10px;
  width: 100%;
}
</style>