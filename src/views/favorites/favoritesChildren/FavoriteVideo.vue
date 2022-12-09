<template>
  <div class="FavoriteVideoContainer">
    <div class="FavoriteVideo">
      <div v-if="favoriteMvList.length == 0" class="tip">
        <div>暂无收藏视频</div>
      </div>
      <div>
        <div class="title" v-if="favoriteMvList.length != 0">
          收藏的视频和MV
        </div>
        <video-list-card
          :videoList="favoriteMvList"
          :videoType="'video'"
          :isLoad="true"
          @clickListCardItem="clickMvItem"
          @bottomLoad="bottomLoad"
        ></video-list-card>
      </div>
    </div>
  </div>
</template>

<script>
import VideoListCard from "components/videoListCard/VideoListCard.vue";
export default {
  components: { VideoListCard },
  name: "FavoriteVideo",
  data() {
    return {
      favoriteMvList: [],
      hasMore: false,
      currentPage: 1,
    };
  },
  methods: {
    // 请求
    // 请求已收藏的专辑
    // 因为这边是下拉加载 不同与收藏歌手和专辑 且每次请求条数比较少 所以这里每次进入重新请求数据 请求的数据也不上传vuex
    async getFavoriteMvList() {
      let timestamp = Date.parse(new Date());
      let res = await this.$request("/mv/sublist", {
        limit: 50,
        offset: 50 * (this.currentPage - 1),
        timestamp,
      });
      this.favoriteMvList.push(...res.data.data);
    },

    // 事件
    // 点击卡片的事件
    clickMvItem({ id, index }) {
      if (this.favoriteMvList[index].type == 0) {
        this.$router.push({ name: "videoDetail", params: { id, type: "mv" } });
      } else {
        this.$router.push({
          name: "videoDetail",
          params: { id, type: "video" },
        });
      }
    },
    // 上拉触底的回调
    bottomLoad() {
      if (this.hasMore) {
        console.log("触底加载");
        this.currentPage += 1;
        this.getFavoriteMvList();
      }
    },
  },
  created() {
    this.getFavoriteMvList();
  },
};
</script>

<style scoped>
.FavoriteVideoContainer {
  display: flex;
  justify-content: center;
  padding: 0 25px;
  /* overflow-y: scroll; */
  /* height: calc(100vh - 162px); */
}

.title {
  font-size: 12px;
  color: #cccccc;
  margin: 0px 0 10px;
}

.tip {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #cccccc;
}
</style>