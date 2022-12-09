<template>
  <div class="SearchMusicList">
    <div class="tip">找到 {{ musicListCount }} 个歌单</div>
    <list-card
      :listCardData="searchMusicList"
      @clickListCardItem="clickListCardItem"
    ></list-card>
    <!-- 分页 -->
    <div class="page" v-if="searchMusicList.length != 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="musicListCount"
        small
        :page-size="30"
        :current-page="currentPage"
        @current-change="pageChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import ListCard from "components/listCard/ListCard.vue";

export default {
  components: { ListCard },
  name: "SearchMusicList",
  data() {
    return {
      musicListCount: 0,
      searchMusicList: [],
      currentPage: 1,
    };
  },
  methods: {
    // 请求
    // 请求搜索歌手
    async getSearchMusicList() {
      let res = await this.$request("/cloudsearch", {
        keywords: this.$route.params.id,
        offset: 30 * (this.currentPage - 1),
        type: 1000,
      });
      console.log(res);
      this.musicListCount = res.data.result.playlistCount;
      this.searchMusicList = res.data.result.playlists;
      // 对数据的音乐时长进行处理
      // this.searchSongList.forEach((item, index) => {
      //   this.searchSongList[index].dt = handleMusicTime(item.dt);
      // });
    },
    // 评论点击翻页的回调
    pageChange(page) {
      this.currentPage = page;
      this.searchMusicList = [];
      this.getSearchMusicList();
    },
    // 点击卡片的回调
    // 跳转至musicListDetail页面
    clickListCardItem(id) {
      this.$router.push({ name: "musicListDetail", params: { id } });
    },
  },
  created() {
    this.getSearchMusicList();
  },
};
</script>

<style scoped>
.SearchMusicList {
  max-width: 1000px;
  margin: auto;
}

.tip {
  font-weight: bold;
  color: #ccc;
  margin-bottom: 10px;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
  margin: 20px 0;
}
</style>