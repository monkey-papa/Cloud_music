<template>
  <div class="Personal">
    <div class="userInfo" v-if="userInfo.avatarUrl">
      <div class="left">
        <img
          :src="userInfo.avatarUrl + '?param=400y400'"
          alt=""
          class="avatar"
        />
      </div>
      <div class="right">
        <div class="rightTop">
          <div class="username">
            <div>{{ userInfo.nickname }}</div>
            <div
              class="logout"
              v-if="isCurrentUser && this.$store.state.isLogin"
            >
              <i class="iconfont icon-zhuxiao1"></i>
              <span @click="logout">退出登录</span>
            </div>
          </div>
          <div class="tags">
            <div class="level">{{ "Lv" + userInfo.level }}</div>
            <div class="gender">
              <!-- 0 保密 1男 2女 -->
            </div>
          </div>
        </div>
        <div class="rightBottom">
          <!-- 动态 关注 粉丝 -->
          <div class="dataNums">
            <div class="numItem">
              <div class="numItemTop">{{ userInfo.eventCount }}</div>
              <div class="numItemBottom">动态</div>
            </div>
            <div
              class="numItem"
              @click="
                $router.push({
                  name: 'follows',
                  params: { uid: $route.params.uid },
                })
              "
            >
              <div class="numItemTop">{{ userInfo.newFollows }}</div>
              <div class="numItemBottom">关注</div>
            </div>
            <div
              class="numItem"
              @click="
                $router.push({
                  name: 'followeds',
                  params: { uid: $route.params.uid },
                })
              "
            >
              <div class="numItemTop">{{ userInfo.followeds }}</div>
              <div class="numItemBottom">粉丝</div>
            </div>
          </div>
          <!-- 其它信息 -->
          <div class="otherInfo">
            <div class="otherInfoItem">
              <div class="otherInfoKey">用户id：</div>
              <div class="ptherInfoValue">{{ userInfo.userId }}</div>
            </div>
            <div class="otherInfoItem">
              <div class="otherInfoKey">所在地区：</div>
              <div class="ptherInfoValue">
                {{ userInfo.province + " " + userInfo.city }}
              </div>
            </div>
            <div class="otherInfoItem">
              <div class="otherInfoKey">个人介绍：</div>
              <div class="ptherInfoValue">
                {{ userInfo.signature == "" ? "暂无介绍" : userInfo.signature }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 歌单 -->
    <div class="musicList">
      <div class="musicListTitle" v-if="createdMusicList.length != 0">
        {{ userInfo.nickname }}创建的歌单({{ createdMusicList.length }})
      </div>
      <list-card
        :listCardData="createdMusicList"
        @clickListCardItem="clickListCardItem"
      ></list-card>
      <div class="musicListTitle" v-if="collectedMusicList.length != 0">
        {{ userInfo.nickname }}收藏的歌单({{ collectedMusicList.length }})
      </div>
      <list-card
        :listCardData="collectedMusicList"
        @clickListCardItem="clickListCardItem"
      ></list-card>
    </div>
  </div>
</template>

<script>
import ListCard from "components/listCard/ListCard.vue";
import { getTimeStamp } from '@/plugins/utils';
export default {
  components: { ListCard },
  name: "Personal",
  data() {
    return {
      // 用户信息
      userInfo: {},
      // 创建的歌单
      createdMusicList: [],
      // 收藏的歌单
      collectedMusicList: [],
      // 该用户是否为当前用户
      isCurrentUser: false,
    };
  },
  methods: {
    // 请求
    // 获取用户信息
    async getUserInfo() {
      let res = await this.$request(
        `/user/detail?uid=${this.$route.params.uid}`
      );
      if (!res) {
        this.$message.error("获取用户信息失败!");
        return;
      }
      // console.log(res);
      res.data.profile["level"] = res.data.level;
      this.userInfo = res.data.profile;
    },

    // 请求用户歌单
    async getUserMusicList() {
      let timestamp = Date.parse(new Date());
      // 先从localStorage里面读取用户信息  如果登录成功是有存的
      let res = await this.$request("/user/playlist", {
        uid: this.$route.params.uid,
        timestamp,
      });
      console.log(res);
      // 对数据进行处理分类
      res = res.data.playlist;
      let index = res.findIndex((item) => item.subscribed == true);
      res[0].name = `${this.userInfo.nickname}喜欢的音乐`;
      this.createdMusicList = res.slice(0, index);
      this.collectedMusicList = res.slice(index);
    },

    // 事件
    // 点击歌单的回调
    clickListCardItem(id) {
      this.$router.push({ name: "musicListDetail", params: { id } });
    },

    // 点击退出登录的回调
    logout() {
      this.$confirm('要退出登录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          let res = await this.$request("/logout",{ timestamp: getTimeStamp() });
          // console.log(res);
          if (res.data.code != 200) {
            this.$message("退出登录失败, 请稍后重试!");
            return;
          }
          // 清空data和localstorage中的数据，以及cookie
          // window.localStorage.setItem("userInfo", "");
          // this.clearAllCookie();
          // 删除localstoarge的userId
          window.localStorage.removeItem("userId");
          //   在vuex中更新登录状态
          this.$store.commit("updataLoginState", false);
          this.$message.success("退出成功!");
          this.isCurrentUser = false;
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      
    },
  },
  watch: {
    "$store.state.isLogin"(current) {
      if (window.localStorage.getItem("userId") && current) {
        this.isCurrentUser =
          window.localStorage.getItem("userId") == this.$route.params.uid;
      }
    },
  },
  async created() {
    await this.getUserInfo();
    this.getUserMusicList();
    // 判断该用户是不是当前登录用户
    if (window.localStorage.getItem("userId")) {
      this.isCurrentUser =
        window.localStorage.getItem("userId") == this.$route.params.uid;
    }
  },
};
</script>

<style scoped>
.Personal {
  height: calc(80vh - 105px);
  overflow-y: scroll;
}

.userInfo {
  margin: 30px 10px;
  display: flex;
}

.avatar {
  margin-top: 5px;
  height: 150px;
  width: 150px;
  object-fit: cover;
  border-radius: 50%;
}

.right {
  margin-left: 20px;
  flex: 1;
}

.username {
  color: #cccccc;
  font-size: 22px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}

.logout {
  margin-right: 10px;
  color: #cccccc;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  cursor: pointer;
  font-weight: lighter;
  padding: 0 15px;
  border: 1px solid rgb(255, 0, 0);
  transform: scale(0.9);
}

.logout:hover {
  background-color: #202023;
}

.logout i {
  font-size: 12px;
  margin-right: 3px;
}

.logout span {
  font-size: 12px;
}

.tags {
  display: flex;
  margin: 10px 0;
}

.level {
  font-size: 12px;
  transform: scale(0.8) translateX(-10%);
  background-color: #202023;
  width: 100;
  padding: 2px 8px;
  border-radius: 5px;
  color: #ff0000;
}

.rightTop {
  width: 100%;
  border-bottom: 1px solid #ddd;
}

.dataNums {
  display: flex;
  margin: 10px 0 5px;
}

.numItem {
  border-left: 1px solid #eee;
  padding: 0 25px;
  text-align: center;
  cursor: pointer;
}

.numItem:nth-child(1) {
  border-left: none;
  padding-left: 3px;
}

.numItemTop {
  color: #ccc;
  font-size: 18px;
}

.numItemBottom {
  font-size: 12px;
  transform: scale(0.8);
}

.otherInfo {
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  user-select: text !important;
}

.otherInfoItem {
  display: flex;
  margin: 5px 0;
}

.otherInfoKey {
  color: #ccc;
}

.otherInfoValue {
  width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.musicListTitle {
  color: #ccc;
  font-weight: bold;
  font-size: 14px;
}

.musicList {
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 30px;
}
</style>
