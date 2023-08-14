<template>
  <div class="lyrics">
    <!-- 占位 -->
    <!-- <div class="placeholder"></div> -->
    <!-- 因为歌词快了一句,所以减1 -->
    <!-- 歌词item -->
    <!-- qq截图量出来的px与代码里的不同，比值差不多0.6417 -->
    <div
      class="lyricsItem"
      :class="lyricsIndex - 1 == index ? 'currentLyric' : ''"
      v-for="(item, index) in lyric"
      :key="index"
    >
      {{ item[1] }}
    </div>
    <!-- 占位 -->
    <div class="placeholder"></div>
    <div class="placeholder"></div>
  </div>
</template>

<script>
import LyricsScroll from './LyricsScroll.js'
export default {
  mixins: [LyricsScroll]
}
</script>

<style scoped>
.lyrics {
  width: 100%;
  height: 275px;
  font-size: 12px;
  text-align: center;
  overflow-y: scroll;
  /* 禁止鼠标能滚动 */
  pointer-events: none;
}

.lyrics::-webkit-scrollbar {
  display: none;
}

.lyricsItem {
  font-size: 12px;
  /* height: 20px; */
  margin: 25px 20px;
  transition: all 0.5s;
  line-height: 20px;
}

.currentLyric {
  font-weight: 600;
  font-size: 24px;
  color: #ec4141;
  font-family:Simsun;
}

.placeholder {
  width: 100%;
  height: 40%;
}
</style>