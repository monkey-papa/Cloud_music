<template>
<!-- 发现音乐里顶部字体样式 -->
  <div class="navBarContainer">
    <div class="navBar">
      <div
        class="barItem"
        :class="index == activeNum ? 'active' : ''"
        v-for="(item, index) in navBarItem"
        :key="index"
        @click="clickBarItem(item.path, index)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      activeNum: 0,
    };
  },
  props: {
    //接收过来的信息
    navBarItem: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  created() {
    // console.log(this.$route.path);
    // 根据地址判断 activeNum
    this.navBarItem.forEach((item, index) => {
      if (decodeURI(this.$route.path).search(item.path) != -1) {
        // console.log(index)个性推荐index为0
        this.activeNum = index;
      }
    });
  },
  methods: {
    clickBarItem(path, index) {
      if (this.activeNum == index) {
        return;
      }

      // console.log(path);
      this.activeNum = index;
      //传给discover.vue
      this.$emit("clickBarItem", path);
    },
  },
};
</script>

<style scoped>
.navBarContainer {
  height: 60px;
  width: 100%;
  position: relative;
  background-color: #16181c;
}

.navBar {
  display: flex;
  position: relative;
  left: 0px;
  top: 0;
  z-index: 100;
  width: 100%;
  color: #ffffff;
  /* color: rgb(255, 0, 0); */
  align-items: center;
  padding: 10px 0 20px 20px;
}
.barItem {
  font-size: 13px;
  margin: 0 10px;
  text-align: center;
  cursor: pointer;
}

.active {
  font-size: 16px;
  color: #b82525;
  font-weight: 600;
  padding-bottom: 5px;
  border-bottom: 3px solid #ec4141;
  transform: translateY(4px);
}
</style>