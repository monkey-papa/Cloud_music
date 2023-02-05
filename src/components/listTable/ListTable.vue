<template>
<!-- 用于排行榜的官方榜 -->
  <div>
    <div class="officalItem">
      <div class="listCover">
        <img
          :src="officialListDetailItem.coverImgUrl || cover"
          alt=""
          @click="
            officialListDetailItem.coverImgUrl
              ? clickCheckAll(officialListDetailItem.id)
              : ''
          "
        />
      </div>
      <div class="listContainer">
        <slot name="header"></slot>
        <table>
          <tr
            class="listRows"
            v-for="(item, index) in (officialListDetailItem.tracks &&
              officialListDetailItem.tracks.slice(0, 5)) ||
            (officialListDetailItem.topSongs &&
              (officialListDetailItem.isOpen
                ? officialListDetailItem.topSongs
                : officialListDetailItem.topSongs.slice(0, 10))) ||
            officialListDetailItem.songs.slice(0, 10)"
            :key="index"
            :class="index==idx?'active':''"
            @click="handleRowClick(item,index)"
            @dblclick="
              handleRowDbClick(officialListDetailItem.id || item.id, index)
            "
          >
            <td class="index">{{ index + 1 }}</td>
            <td class="musicName">{{ item.name }}</td>
            <td class="singer">{{ item.ar[0].name }}</td>
          </tr>
        </table>
        <div
          class="checkAll"
          @click="clickCheckAll(officialListDetailItem.id)"
          v-show="isCheckAllShow"
        >
          查看全部 <i class="iconfont icon-arrow-right-bold"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListTable",
  data() {
    return {
      idx:-1
    };
  },
  props: {
    officialListDetailItem: {
      type: Object,
      default() {
        return {};
      },
    },
    // 传过来的封面
    cover: {
      type: String,
      default() {
        return "";
      },
    },
    // 传过来的listId
    listId: {
      type: String,
      default() {
        return "";
      },
    },
    // 是否显示查看全部按钮
    isCheckAllShow: {
      type: Boolean,
      default() {
        return true;
      },
    },
  },
  methods: {
    // 点击行的回调 （选中）
    handleRowClick(item,index) {
      // // 点击时，事件对象可能是td或tr，这里做下判断
      // let path;
      // console.log(event)
      // if (event.path[0].localName == "tr") {
      //   path = event.path[0];
      // } else {
      //   path = event.path[1];
      // }
      // this.$emit("handleRowClick", path);
      this.idx = index
    },
    // 双击行的回调 播放
    // id 为当前歌单的id index为双击歌曲在歌单的索引
    handleRowDbClick(id, index) {
      let listId = this.listId;
      this.$emit("handleRowDbClick", { id, index, listId });
    },
    // 点击查看全部的回调
    // 这里传来的id是用于Rangking的
    clickCheckAll(id) {
      let listId = this.listId;
      this.$emit("clickCheckAll", { id, listId });
    },
  },
};
</script>

<style scoped>
.officalItem {
  display: flex;
  margin: 20px 0 50px 0;
}

.listCover {
  width: 150px;
  height: 150px;
  margin-right: 20px;
  cursor: pointer;
}

.listCover img {
  width: 100%;
  border-radius: 10px;
}

.listContainer {
  width: calc(100% - 200px);
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 5px;
  overflow: hidden;
}

.listRows {
  height: 30px;
  font-size: 12px;
  color: rgb(153, 153, 153);
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.listRows:nth-child(odd) {
  background-color: #202023;
}
/* .listRows:hover {
  background-color: #ff4e4e;
} */

.listRows td {
  transform: scale(0.9);
}

.index {
  text-align: center;
  line-height: 28px;
  width: 30px;
}

.topthree {
  color: crimson;
}

.listRows .musicName {
  transform: translate(-5%, -5%) scale(0.9);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 80%;
}
.singer {
  text-align: right;
  position: absolute;
  right: 10px;
}

.checkAll {
  color: rgb(134, 134, 134);
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  width: 100px;
  height: 30px;
  line-height: 30px;
  cursor: pointer;
}

.checkAll i {
  font-size: 12px;
}

::v-deep .selectRow {
  /* background-color: #ff4e4e !important; */
  color: #b82525 !important;
}

tr {
  cursor: pointer;
}
::v-deep .listContainer tr.listRows.active{
  color:#b82525;
}
</style>