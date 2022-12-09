<template>
  <div class="musicListIndex">
    <!-- 歌单入口展示 -->
    <div class="highqualityEntry">
      <img
        :src="theFirstOfHighquality.coverImgUrl"
        alt=""
        class="backgroundImg"
      />
      <div class="cover">
        <img :src="theFirstOfHighquality.coverImgUrl" alt="" />
      </div>
      <div class="EntryInfo">
        <div class="tag"><i class="iconfont icon-good"></i> 精品歌单</div>
        <div class="name">{{ theFirstOfHighquality.name }}</div>
        <div class="desc">{{ theFirstOfHighquality.copywriter }}</div>
      </div>
    </div>
    <!-- 歌单列表 -->
    <div class="musicListNavBar">
      <div class="left">
        <sort-box
          :currentTag="currentTag"
          :sortList="sortList"
          @getSortList="getSortList"
          @clickSortBoxItem="clickSortBoxItem"
        ></sort-box>
      </div>
      <div class="right">
        <second-nav-bar
          :SecondNavBarData="hotTags"
          :itemWidth="0"
          :currentTag="currentTag"
          @clickSecondBarItem="clickSecondBarItem"
        ></second-nav-bar>
      </div>
    </div>
    <!-- 展示歌单列表 -->
    <list-card
      :listCardData="musicList.playlists"
      @clickListCardItem="clickListCardItem"
    ></list-card>
    <!-- 分页 -->
    <div class="page" v-if="musicList.playlists">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="musicList.total"
        :page-size="50"
        small
        :current-page="currentPage"
        @current-change="pageChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import SecondNavBar from "components/secondNavBar/SecondNavBar.vue";
import ListCard from "components/listCard/ListCard.vue";
import SortBox from "components/sortBox/SortBox.vue";
export default {
  components: {
    SecondNavBar,
    ListCard,
    SortBox,
  },
  name: "musicListIndex",
  data() {
    return {
      theFirstOfHighquality: {},
      hotTags: [],
      musicList: {},
      currentTag: {},
      currentPage: 1,
      // 分类数据
      sortList: [],
    };
  },
  methods: {
    // 处理请求事件
    // 获取高质量歌单的第一条数据
    async getTheFirstOfHighquality() {
      let result = await this.$request("/top/playlist/highquality", {
        limit: 1,
      });
      //   console.log(result);
      this.theFirstOfHighquality = result.data.playlists[0];
      //   console.log(this.theFirstOfHighquality);
    },
    // 获取热门歌单tag数据
    async getHotTag() {
      let result = await this.$request("/playlist/hot");
      // console.log(result);
      this.currentTag = result.data.tags[0];
      this.hotTags = result.data.tags;
    },
    // 根据歌名请求歌单列表
    async getMusicList() {
      this.musicList = {};
      let result = await this.$request("/top/playlist", {
        cat: this.currentTag.name,
        offset: 50 * (this.currentPage - 1),
      });
      // console.log(result);
      // 里面的total可以用于分页，所以把整个对象都保存下来
      this.musicList = result.data;
    },

    // 获取歌单分类数据
    async getSortList() {
      let res = await this.$request("/playlist/catlist");
      // console.log(res);
      this.sortList = res.data.sub;
    },

    // 处理点击事件
    // 接收点击二级navbar的回调
    clickSecondBarItem(index) {
      // console.log(this.hotTags[index].name);
      this.currentTag = this.hotTags[index];
      this.currentPage = 1;
      // 先清空musicList
      this.getMusicList();
    },
    //当页数发生改变时
    pageChange(page) {
      // page是当前页数
      // console.log(e);
      this.currentPage = page;
      this.getMusicList();
    },
    // 点击歌单的回调
    clickListCardItem(id) {
      console.log(id);
      this.$router.push({ name: "musicListDetail", params: { id } });
    },
    // 点击sortBoxItem中的回调
    clickSortBoxItem(item) {
      this.currentTag = item;
      this.currentPage = 1;
      this.getMusicList();
    },
  },
  // created生命周期
  async created() {
    this.getTheFirstOfHighquality();
    await this.getHotTag();
    this.getMusicList();
  },
};
</script>

<style scoped>
.highqualityEntry {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
}
.backgroundImg {
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  width: 100%;
  transform: translateY(-80px);
  filter: blur(30px) brightness(70%);
}

.cover {
  width: 120px;
  height: 120px;
  margin: 10px;
}

.cover img {
  border-radius: 10px;
  width: 100%;
}

.tag {
  color: #d59e54;
  border: 1px solid #b82525;
  padding: 5px 10px;
  width: 88px;
  font-size: 12px;
  margin: 20px 10px 15px;
  border-radius: 5px;
}

.tag i {
  font-size: 14px;
}

.name {
  color: white;
  font-size: 14px;
  margin: 10px 0;
}

.desc {
  color: rgba(255, 255, 255, 0.5);
  /* 字体直接写小于12没有效果 */
  font-size: 12px;
  transform: scale(0.9, 0.9);
}

.musicListNavBar {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
}
</style>