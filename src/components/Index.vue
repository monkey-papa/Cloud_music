<template>
  <el-container>
    <el-header>
      <header-bar></header-bar>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="160px">
        <el-menu
          active-text-color="black"
          router
          :default-active="defaultActive"
        >
          <el-menu-item index="/discover">
            <i class="iconfont icon-yinle"></i>
            <span slot="title">发现音乐</span>
          </el-menu-item>
          <el-menu-item index="/video">
            <i class="iconfont icon-shipin"></i>
            <span slot="title">视频</span>
          </el-menu-item>
          <el-menu-item index="/favorites">
            <i class="iconfont icon-more"></i>
            <span slot="title">收藏</span>
          </el-menu-item>
          <el-menu-item index="/recommendmusic">
            <i class="iconfont icon-good"></i>
            <span slot="title">每日推荐</span>
          </el-menu-item>
          <el-menu-item-group v-if="createdMusicList.length != 0">
            <template slot="title" class="groupTitle">创建的歌单</template>
            <el-menu-item
              v-for="(item, index) in createdMusicList"
              :key="index"
              :index="'/musiclistdetail/' + item.id"
            >
              <i class="iconfont icon-gedan"></i>{{ item.name }}</el-menu-item
            >
          </el-menu-item-group>

          <el-menu-item-group v-if="collectedMusicList.length != 0">
            <template slot="title" class="groupTitle">收藏的歌单</template>
            <el-menu-item
              v-for="(item, index) in collectedMusicList"
              :key="index"
              :index="'/musiclistdetail/' + item.id"
            >
              <i class="iconfont icon-gedan"></i>{{ item.name }}</el-menu-item
            >
          </el-menu-item-group>
        </el-menu>
      </el-aside>
      <!-- 主体内容 -->
      <el-main>
        <!-- 给router-view添加key有可能对性能有一定的损耗，
        但是可以解决push同一个地址不同参数时不会重新渲染router-view的问题 -->
        <router-view class="routerView" :key="$route.fullPath"></router-view>
        <!-- 用于下载的a标签 -->
        <a
          :href="downloadMusicInfo.url"
          :download="downloadMusicInfo.name"
          target="_blank"
          id="downloadCurrentMusic"
        ></a>
      </el-main>
    </el-container>
    <bottom-control></bottom-control>
    <music-detail-card class="musicDetailCard"></music-detail-card>
  </el-container>
</template>

<script>
import axios from "axios";

import BottomControl from "components/bottomControl/BottomControl";
import HeaderBar from "components/headerBar/HeaderBar.vue";
import MusicDetailCard from "views/musicDetailCard/MusicDetailCard.vue";
export default {
  components: {
    BottomControl,
    HeaderBar,
    MusicDetailCard,
  },
  data() {
    return {
      defaultActive: "",
      // 用户信息
      // userInfo: {},
      // 创建的歌单
      createdMusicList: [],
      // 收藏的歌单
      collectedMusicList: [],
      // 下载的音乐的信息
      downloadMusicInfo: {
        name: "",
        url: "",
      },
    };
  },
  created() {
    if (this.$route.path.search("/musiclistdetail") == -1) {
      this.defaultActive = "/" + this.$route.path.split("/")[1];
    } else {
      this.defaultActive = this.$route.path;
    }
  },
  methods: {
    // 请求
    // 请求用户歌单
    async getUserMusicList() {
      if (!this.$store.state.isLogin) {
        // 说明已经退出登录
        this.$message.error("请先进行登录操作");
        return;
      }
      let timestamp = Date.parse(new Date());
      // 先从localStorage里面读取用户信息  如果登录成功是有存的
      // this.userInfo =
      //   window.localStorage.getItem("userInfo") &&
      //   JSON.parse(window.localStorage.getItem("userInfo"));

      let res = await this.$request("/user/playlist", {
        uid: window.localStorage.getItem("userId"),
        timestamp,
      });
      // console.log(res);
      // 对数据进行处理分类
      res = res.data.playlist;
      let index = res.findIndex((item) => item.subscribed == true);
      // console.log(index);//3  索引3以上就是我喜欢的音乐里面的
      this.createdMusicList = res.slice(0, index);
      this.collectedMusicList = res.slice(index);
      this.createdMusicList[0].name = "我喜欢的音乐";
      // console.log(this.createdMusicList, this.collectedMusicList);
      // 将收藏的歌单上传至vuex
      this.$store.commit("updateCollectMusicList", this.collectedMusicList);
      // 将创建的歌单上传至vuex
      this.$store.commit("updateCreatedMusicList", this.createdMusicList);
    },
  },
  watch: {
    // $route(to, from) {
    //   if (to !== from) {
    //     // 直接 go会导致整个页面进行刷新
    //     // this.$router.go(0);
    //   }
    // },
    // 监听收藏歌单的变化
    "$store.state.collectMusicList"(current) {
      // console.log(current);
      this.collectedMusicList = current;
    },
    "$route.path"(current) {
      // 取路由中的首地址 用于侧边栏的导航active
      if (current.search("/musiclistdetail") == -1) {
        this.defaultActive = "/" + current.split("/")[1];
      } else {
        this.defaultActive = current;
      }
      // console.log(current, this.defaultActive);
    },

    // 监听当前下载音乐信息
    "$store.state.downloadMusicInfo"(current) {
      axios
        .get(current.url, { responseType: "blob" })
        .then((res) => {
          let blob = res.data;
          let url = URL.createObjectURL(blob);
          // console.log(url);///m7/20221208221128/80fb1309ad06f834c9226a6324757115/ymusic/ec76/af83/5e9b/eb8ec76417d27fff64faa33d86b3d3dc.mp3
          let a = document.querySelector("#downloadCurrentMusic");
          this.downloadMusicInfo.url = url;
          this.downloadMusicInfo.name = current.name;
          this.$nextTick(() => {
            a.click();
            // 用完释放URL对象
            //手动释放内存
            URL.revokeObjectURL(url);
          });
        })
        .catch((err) => {
          console.log(err);
          this.$message.error("下载失败,请稍后重试!");
        });

      // this.downloadMusicInfo = current;
      // let a = document.querySelector("#downloadCurrentMusic");
      // this.$nextTick(() => {
      //   a.click();
      // });
    },
    // 监听vuex中的登录状态
    "$store.state.isLogin"(current) {
      // console.log(current);
      if (current) {
        this.getUserMusicList();
      } else {
        // 清空收藏和创建歌单
        this.createdMusicList = [];
        this.collectedMusicList = [];
      }
    },
  },
};
</script>

<style scoped>
.is-active {
  background-color: #f6f6f7;
  font-size: 14px;
  font-weight: 600;
}

.iconfont {
  font-size: 14px;
  margin: 5px !important;
}

.routerView {
  padding: 0 15px;
  margin: 0;
  width: 100%;
  height: calc(80vh - 105px);
}

.el-header {
  background-color: #202023;
  height: 50px !important;
  padding: 0;
  margin: 0;
  z-index: 100;
}

.el-aside {
  border-right: 1px solid #191b1f;
  height: calc(80vh - 105px);
  background: #191b1f;
}

.el-menu {
  border: none;
  background: #191b1f;
  /* 取消横向滚动条 */
  overflow-x: hidden;
}

.el-menu-item:hover {
  background-color: #313131 !important;
  transform:translateX(3px);
}

.el-menu-item {
  font-size: 12px;
  padding: 0 0 0 10px !important;
  margin: 5px 0 !important;
  height: 30px;
  line-height: 30px;
  background: #191b1f;
  color: #cccccc;
}

.el-menu-item.is-active{
  color: #b82525 !important;
  background: #313131 !important;
}

.el-menu-item-group {
  margin-top: 10px;
  background: #191b1f;
}

.el-main {
  padding: 0;
}
</style>