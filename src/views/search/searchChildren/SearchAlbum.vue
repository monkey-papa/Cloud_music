<template>
  <div class="SearchAlbum">
    <div class="tip">找到 {{ albumCount }} 个专辑</div>
    <list-card
      :listCardData="searchAlbumList"
      @clickListCardItem="clickListCardItem"
    ></list-card>
    <!-- 分页 -->
    <div class="page" v-if="searchAlbumList.length != 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="albumCount"
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
  name: "SearchAlbum",
  data() {
    return {
      albumCount: 0,
      searchAlbumList: [],
      currentPage: 1,
    };
  },
  methods: {
    // 请求
    // 请求搜索专辑
    async getSearchAlbum() {
      let res = await this.$request("/cloudsearch", {
        keywords: this.$route.params.id,
        offset: 30 * (this.currentPage - 1),
        type: 10,
      });
      console.log(res);
      this.albumCount = res.data.result.albumCount;
      this.searchAlbumList = res.data.result.albums;
      // 对数据的音乐时长进行处理
      // this.searchSongList.forEach((item, index) => {
      //   this.searchSongList[index].dt = handleMusicTime(item.dt);
      // });
    },
    // 评论点击翻页的回调
    pageChange(page) {
      this.currentPage = page;
      this.searchAlbumList = [];
      this.getSearchAlbum();
    },
    // 点击卡片的回调
    // 跳转至albumDetail页面
    clickListCardItem(id) {
      this.$router.push({ name: "album", params: { id } });
    },
  },
  created() {
    this.getSearchAlbum();
  },
};
</script>

<style scoped>
.SearchAlbum {
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