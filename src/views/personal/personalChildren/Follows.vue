<template>
  <div class="Follows">
    <div class="title">{{ userName + "的关注" }}</div>
    <user-list-card
      :userList="userList"
      :isLoad="isMore"
      @bottomLoad="bottomLoad"
    ></user-list-card>
    <go-top scrollObj=".Follows"></go-top>
  </div>
</template>

<script>
import UserListCard from "components/userListCard/UserListCard.vue";
import GoTop from "components/goTop/GoTop.vue";
export default {
  components: { UserListCard, GoTop },
  name: "Followeds",
  data() {
    return {
      // 当前页数
      currentPage: 1,
      // 用户列表
      userList: [],
      userName: "",
      // 是否有更多数据
      isMore: false,
    };
  },
  methods: {
    // 请求
    // 获取粉丝列表
    async getFolloweds() {
      let res = await this.$request("/user/follows", {
        uid: this.$route.params.uid,
        offset: (this.currentPage - 1) * 30,
      });
      console.log(res);
      this.isMore = res.data.more;
      this.userList.push(...res.data.follow);
    },
    // 获取当前用户信息
    async getUserInfo() {
      let res = await this.$request(
        `/user/detail?uid=${this.$route.params.uid}`
      );
      console.log(res);
      this.userName = res.data.profile.nickname;
    },

    // 用户列表触底的回调
    bottomLoad() {
      // console.log("触底了");
      this.currentPage += 1;
      this.getFolloweds();
    },
  },
  created() {
    this.getFolloweds();
    this.getUserInfo();
  },
};
</script>

<style scoped>
.Follows {
  overflow-y: scroll;
}

.title {
  color: #373737;
  font-weight: bold;
  margin: 20px 30px;
}
</style>
