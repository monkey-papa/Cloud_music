<template>
<!-- 查看关注的人/收藏者的列表 -->
  <div
    class="UserListCard"
    v-infinite-scroll="load"
    :infinite-scroll-disabled="disabled"
    :infinite-scroll-distance="300"
    :infinite-scroll-immediate="false"
  >
    <div
      class="userItemContainer"
      v-for="(item, index) in userList"
      :key="index"
      @click="clickUser(item.userId)"
    >
      <div class="userItem">
        <div class="left">
          <img :src="item.avatarUrl + '?param=200y200'" alt="" class="avatar" />
        </div>
        <div class="right">
          <div class="nickName">{{ item.nickname }}</div>
          <div class="signature">
            {{ item.signature }}
          </div>
          <div class="nums" v-if="userType == 'personalPage'">
            <div class="musicListNum">{{ "歌单: " + item.playlistCount }}</div>
            <div class="fenge">|</div>
            <div class="followedsNum">{{ "粉丝: " + item.followeds }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserListCard",
  props: {
    userList: {
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
    userType: {
      type: String,
      default() {
        return "personalPage";
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
    // 事件
    // 点击useritem的事件
    clickUser(id) {
      // console.log(id);
      this.$router.push({ name: "personal", params: { uid: id } });
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
    userList() {
      if (this.isLoad == true) {
        if (this.userList.length != 0) {
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
.UserListCard {
  display: flex;
  flex-wrap: wrap;
}

.userItemContainer {
  margin: 0 auto;
}

.userItem {
  display: flex;
  width: 350px;
  padding: 10px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.userItem:hover {
  background-color: #202023;
}

.avatar {
  height: 70px;
  width: 70px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #eee;
  margin-right: 10px;
}

.nickName {
  margin: 10px 0 5px;
  font-size: 13px;
  color: #ccc;
}

.signature {
  font-weight: lighter;
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 250px;
  height: 13px;
  margin: 5px 0;
}

.nums {
  display: flex;
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  color: #888;
}

.fenge {
  color: #ddd;
  margin: 0 10px;
}
</style>
