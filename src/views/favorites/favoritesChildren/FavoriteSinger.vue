<template>
  <div class="FavoriteSingerContainer">
    <div class="FavoriteSinger">
      <div v-if="count != 0">
        <div class="title">收藏的歌手({{ count }})</div>
        <list-card
          :listCardData="favoriteSingerList"
          @clickListCardItem="clickListCardItem"
        ></list-card>
      </div>
      <div v-else class="tip"><div>暂无收藏歌手</div></div>
    </div>
  </div>
</template>

<script>
import ListCard from "components/listCard/ListCard.vue";
export default {
  components: { ListCard },
  name: "FavoriteSinger",
  data() {
    return {
      favoriteSingerList: [],
      count: 0,
    };
  },
  methods: {
    // 请求
    // 请求已收藏的歌手
    async getFavoriteSingerList() {
      let timestamp = Date.parse(new Date());
      let res = await this.$request("/artist/sublist", timestamp);
      this.favoriteSingerList = res.data.data;
      this.count = res.data.count;
      this.$store.commit("updateSubSingerList", res.data.data);
    },

    // 事件
    // 点击卡片的事件
    clickListCardItem(id) {
      this.$router.push({ name: "singerDetail", params: { id } });
    },
  },
  created() {
    if (this.$store.state.subSingerList == null) {
      this.getFavoriteSingerList();
    } else {
      this.favoriteSingerList = this.$store.state.subSingerList;
      this.count = this.$store.state.subSingerList.length;
    }
  },
  watch: {
    "$store.state.subSingerList"(current) {
      this.favoriteSingerList = current;
      this.count = current.length;
    },
  },
};
</script>

<style scoped>
.FavoriteSingerContainer {
  display: flex;
  justify-content: center;
  padding: 0 25px;
  /* overflow-y: scroll; */
  /* height: calc(100vh - 162px); */
}

.FavoriteSinger {
  max-width: 1000px;
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