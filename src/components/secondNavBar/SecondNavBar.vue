<template>
  <div class="navBar">
    <!-- 如果传入的宽度是0则不设置宽度，宽度自适应 -->
    <div
      class="barItem"
      :class="index == activeNum ? 'active' : ''"
      v-for="(item, index) in SecondNavBarData"
      :key="index"
      @click="clickSecondBarItem(index)"
      :style="itemWidth == 0 ? '' : 'width:' + itemWidth + 'px;'"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script>
export default {
  name: "SecondNavBar",
  data() {
    return {
      activeNum: 0,
    };
  },
  props: {
    SecondNavBarData: {
      type: Array,
      default() {
        return [];
      },
    },
    itemWidth: {
      type: Number,
      default() {
        return 40;
      },
    },
    currentTag: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  methods: {
    clickSecondBarItem(index) {
      if (this.activeNum == index) {
        return;
      }

      this.activeNum = index;
      // 将点击事件发射出去 供使用改组件接收事件使用
      this.$emit("clickSecondBarItem", index);
    },
  },
  watch: {
    currentTag(current) {
      this.activeNum = this.SecondNavBarData.findIndex(
        (item) => item.name == current.name
      );
    },
  },
};
</script>

<style scoped>
.navBar {
  display: flex;
  flex-wrap: wrap;
}

.barItem {
  margin: 4px -2px;
  padding: 6px 10px;
  font-size: 12px;
  /* width: 40px; */
  text-align: center;
  box-sizing: content-box;
  transform: scale(0.9, 0.9);
  cursor: pointer;
}

.active {
  background-color: #16181c;
  color: #b82525;
  border-radius: 11px;
}
</style>