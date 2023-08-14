<template>
<!-- 歌手 -->
  <div class="singerContainer">
    <div class="singer">
      <!-- 歌手分类选择 -->
      <div class="selectors">
        <div class="selectorItem">
          <div class="title">语种：</div>
          <second-nav-bar
            :SecondNavBarData="languageSort"
            @clickSecondBarItem="areaItem"
            class="secondNavBar"
          ></second-nav-bar>
        </div>
        <div class="selectorItem">
          <div class="title">分类：</div>
          <second-nav-bar
            :SecondNavBarData="typeSort"
            @clickSecondBarItem="typeItem"
            class="secondNavBar"
          ></second-nav-bar>
        </div>
        <div class="selectorItem">
          <div class="title">筛选：</div>
          <second-nav-bar
            :SecondNavBarData="initialSort"
            @clickSecondBarItem="initialItem"
            class="secondNavBar"
          ></second-nav-bar>
        </div>
      </div>
      <div class="listCardContainer">
        <!-- 歌手列表 -->
        <list-card
          class="listCard"
          :listCardData="singerList"
          @clickListCardItem="clickListCardItem"
          isLoad
          @bottomLoad="bottomLoad"
        ></list-card>
      </div>
    </div>
    <go-top scrollObj=".singerContainer"></go-top>
  </div>
</template>

<script>
import ListCard from "components/listCard/ListCard.vue";
import SecondNavBar from "components/secondNavBar/SecondNavBar.vue";
import GoTop from "components/goTop/GoTop.vue";
export default {
  components: { SecondNavBar, ListCard, GoTop },
  name: "singer",
  data() {
    return {
      languageSort: [
        { area: -1, name: "全部" },
        { area: 7, name: "华语" },
        { area: 96, name: "欧美" },
        { area: 8, name: "日本" },
        { area: 16, name: "韩国" },
        { area: 0, name: "其它" },
      ],
      typeSort: [
        { type: -1, name: "全部" },
        { type: 1, name: "男歌手" },
        { type: 2, name: "女歌手" },
        { type: 3, name: "乐队" },
      ],
      initialSort: [
        { initial: -1, name: "热门" },
        { initial: "a", name: "A" },
        { initial: "b", name: "B" },
        { initial: "c", name: "C" },
        { initial: "d", name: "D" },
        { initial: "e", name: "E" },
        { initial: "f", name: "F" },
        { initial: "g", name: "G" },
        { initial: "h", name: "H" },
        { initial: "i", name: "I" },
        { initial: "j", name: "J" },
        { initial: "k", name: "K" },
        { initial: "l", name: "L" },
        { initial: "m", name: "M" },
        { initial: "n", name: "N" },
        { initial: "o", name: "O" },
        { initial: "p", name: "P" },
        { initial: "q", name: "Q" },
        { initial: "r", name: "R" },
        { initial: "s", name: "S" },
        { initial: "t", name: "T" },
        { initial: "u", name: "U" },
        { initial: "v", name: "V" },
        { initial: "w", name: "W" },
        { initial: "x", name: "X" },
        { initial: "y", name: "Y" },
        { initial: "z", name: "Z" },
        { initial: 0, name: "#" },
      ],
      area: -1,
      type: -1,
      initial: -1,
      // 当前所在页数
      currentPage: 1,
      singerList: [],
      // 是否还有更多数据
      isMore: false,
    };
  },
  methods: {
    // 请求
    // 请求歌手列表
    async getSingerList() {
      let res = await this.$request("/artist/list", {
        type: this.type,
        area: this.area,
        initial: this.initial,
        offset: (this.currentPage - 1) * 30,
      });
      // console.log(res);
      this.singerList.push(...res.data.artists);
      this.isMore = res.data.more;
    },

    // 事件处理
    // 地区
    areaItem(index) {
      // console.log(this.languageSort[index].area);
      this.area = this.languageSort[index].area;
      // 先清空list 再请求数据
      this.singerList = [];
      this.currentPage = 1;
      this.getSingerList();
    },
    // 分类
    typeItem(index) {
      // console.log(this.typeSort[index].type);
      this.type = this.typeSort[index].type;
      // 先清空list 再请求数据
      this.currentPage = 1;
      this.singerList = [];
      this.getSingerList();
    },
    // 筛选
    initialItem(index) {
      // console.log(this.initialSort[index].initial);
      this.initial = this.initialSort[index].initial;
      // 先清空list 再请求数据
      this.currentPage = 1;
      this.singerList = [];
      this.getSingerList();
    },
    // 点击歌手item的回调
    clickListCardItem(id) {
      // console.log(id);
      this.$router.push({ name: "singerDetail", params: { id } });
    },
    // 卡片上拉触底触发
    bottomLoad() {
      // console.log("bottomLoad");
      // 如果还有更多数据 则发送请求 将数据 push到数组
      if (this.isMore == true) {
        this.currentPage += 1;
        this.getSingerList();
      }
    },
  },
  created() {
    this.getSingerList();
  },
  mounted() {},
};
</script>

<style scoped>
.singerContainer {
  display: flex;
  justify-content: center;
  background-color: #16181c;

}

.singer {
  max-width: 1000px;
  padding: 0 10px;
}

.selectorItem {
  display: flex;
}

.title {
  font-size: 12px;
  width: 40px;
  line-height: 33px;
}

.secondNavBar {
  width: calc(100% - 60px);
}

.page {
  width: 100%;
  text-align: center;
}

.listCardContainer {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>