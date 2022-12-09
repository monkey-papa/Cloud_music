<template>
<!-- 用于展示全球榜 -->
  <div
    class="listCard"
    v-infinite-scroll="load"
    :infinite-scroll-disabled="disabled"
    :infinite-scroll-distance="300"
    :infinite-scroll-immediate="false"
    ref="listCard"
  >
    <div
      class="listCardItem"
      v-for="(item, index) in listCardData"
      :key="index"
      @click="clickListCardItem(item.id)"
    >
      <div class="image">
        <img
          :src="(item.picUrl || item.coverImgUrl) + '?param=400y400'"
          alt=""
        />
      </div>
      <div class="title">{{ item.name }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListCard",
  props: {
    listCardData: {
      type: Array,
      default() {
        return [];
      },
    },
    // 是否使用上拉触底事件
    isLoad: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      // 无限滚动是否可用
      disabled: true,
    };
  },
  methods: {
    clickListCardItem(id) {
      this.$emit("clickListCardItem", id);
    },
    // 上拉触底触发
    load() {
      //   console.log("滑动到底部");
      this.$emit("bottomLoad");
      // 触发load后加载数据 期间不允许再次触发load事件
      this.disabled = true;
    },
  },
  watch: {
    //   数据更新后，可再次运行触发load事件
    listCardData() {
      if (this.isLoad == true) {
        if (this.listCardData.length != 0) {
          this.disabled = false;
        } else {
          this.disabled = true;
        }
      }
    },
  },
};
</script>

<style scoped>
.listCard {
  display: flex;
  flex-wrap: wrap;
  margin: 10px 0;
}

.listCardItem {
  width: 18.4%;
  margin: 0 2% 20px 0;
  overflow: hidden;
  cursor: pointer;
}

.listCardItem:nth-child(5n) {
  margin-right: 0;
}

.image {
  width: 100%;
  padding-bottom: 100%;
  height: 0;
  position: relative;
}

.image::after {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: url("~assets/img/imgLoading.png") no-repeat center;
  background-size: contain;
  border-radius: 10px;
  z-index: -1;
}

.image img {
  width: 100%;
  border-radius: 10px;
}

.title {
  margin-top: 8px;
  padding: 0 2px;
  font-size: 12px;
  color: #cccccc;
  line-height: 17px;
  /* 两行溢出 */
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>