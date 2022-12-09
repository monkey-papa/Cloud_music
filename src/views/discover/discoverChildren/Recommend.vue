<template>
  <div class="recommendContainer">
    <!-- 个性推荐 -->
    <!-- 轮播图 -->
    <div class="recommend">
      <div class="carousel">
        <el-carousel :interval="4000" type="card" height="180px">
          <el-carousel-item v-for="(item, index) in bannerData" :key="index">
            <img :src="item.imageUrl" alt="" />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 推荐歌单 -->
      <div class="recommendMusicList">
        <h3>推荐歌单<i class="iconfont icon-arrow-right-bold"></i></h3>
        <list-card
          :listCardData="musicList"
          @clickListCardItem="clickListCardItem"
        ></list-card>
      </div>
    </div>
  </div>
</template>

<script>
import ListCard from "components/listCard/ListCard.vue";
export default {
  components: { ListCard },
  name: "Recommend",
  data() {
    return {
      // 轮播图数据
      bannerData: [],
      // recommend页面显示的musicList
      musicList: [],
    };
  },
  methods: {
    // 请求轮播图数据
    async getBannerData() {
      let result = await this.$request("/banner");
      // console.log(result);
      this.bannerData = result.data.banners;
    },

    // 请求推荐歌单数据的前十个
    getMusicList() {
      this.$request("/personalized", { limit: 10 }).then((res) => {
        // console.log(res);
        this.musicList = res.data.result;
      });
    },
    // 点击歌单封面的回调
    clickListCardItem(id) {
      // console.log(id);
      this.$router.push({ name: "musicListDetail", params: { id } });
    },
  },
  created() {
    this.getBannerData();
    this.getMusicList();
  },
};
</script>

<style scoped>
.recommendContainer {
  display: flex;
  justify-content: center;
  background-color: #16181c;
}

.recommend {
  max-width: 1000px;
}

.carousel {
  width: 100%;
}

.el-carousel {
  margin: auto;
  width: 800px;
}

.el-carousel__item {
  border-radius: 10px;
}

.el-carousel__item img {
  height: 100%;
}

.recommendMusicList {
  margin: 20px 10px;
}

.recommendMusicList h3 {
  color: #cccccc;
}
</style>