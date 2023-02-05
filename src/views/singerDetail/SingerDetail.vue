<template>
  <div v-if="singerInfo.cover" class="singerDetail">
<!-- 歌手的详情页 -->
    <!-- 歌单信息 -->
    <div class="listInfo">
      <!-- 歌单封面 -->
      <div class="listAvatar">
        <img :src="singerInfo.cover + '?param=300y300'" alt="" />
      </div>
      <div class="right">
        <!-- 标题 -->
        <div class="title">
          <div class="titleContent">{{ singerInfo.name }}</div>
        </div>
        <!-- 操作按钮 -->
        <div class="buttons">
          <div class="buttonItem bg" @click="subSinger">
            <i class="iconfont icon-xihuan" :class="isSub ? 'red' : ''"></i>
            <span>{{ isSub ? "已收藏" : "收藏" }}</span>
          </div>
          <div class="buttonItem bg">
            <i class="iconfont icon-link"></i>
            <span>个人主页</span>
          </div>
        </div>
        <!-- 歌曲列表的歌曲数量和播放量 -->
        <div class="otherInfo">
          <div class="musicNum">单曲数 : {{ singerInfo.musicSize }}</div>
          <div class="musicNum">专辑数 : {{ singerInfo.albumSize }}</div>
          <div class="musicNum">MV数 : {{ singerInfo.mvSize }}</div>
        </div>
      </div>
    </div>
    <!-- 歌曲列表 -->
    <div class="musicList">
      <el-tabs value="first" @tab-click="clickTab">
        <el-tab-pane label="专辑" name="first">
          <div class="topSongs" v-if="topSongs.topSongs">
            <!-- 热门50首没有id，将歌手id作为listid -->
            <list-table
              :officialListDetailItem="topSongs"
              @handleRowClick="handleRowClick"
              @handleRowDbClick="handleRowDbClick"
              @clickCheckAll="allTopSongs"
              :isCheckAllShow="isCheckAllShow"
              :cover="require('/src/assets/img/topSongsLogo.png')"
              :listId="this.$route.params.id.toString()"
            >
              <div slot="header" class="header">
                <div class="title">热门50首</div>
              </div>
            </list-table>
          </div>
          <div
            class="albumItemContainer"
            v-if="singerAlbum.length != 0"
            v-infinite-scroll="load"
            :infinite-scroll-disabled="disabled"
            :infinite-scroll-distance="300"
            :infinite-scroll-immediate="false"
          >
            <div
              class="albumItem"
              v-for="(item, index) in singerAlbum"
              :key="index"
            >
              <list-table
                :officialListDetailItem="item.songsObj"
                @handleRowClick="handleRowClick"
                @handleRowDbClick="handleRowDbClick"
                @clickCheckAll="clickListCardItem"
                :cover="item.album.blurPicUrl + '?param=300y300'"
                :listId="item.album.id.toString()"
              >
                <div slot="header" class="header">
                  <div class="title">{{ item.album.name }}</div>
                </div>
              </list-table>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="MV" name="second">
          <video-list-card
            :videoList="singerMvInfo.mvs"
            :isLoad="true"
            @clickListCardItem="goToVideoDetail"
            @bottomLoad="bottomLoad"
          ></video-list-card>
        </el-tab-pane>
        <el-tab-pane label="歌手详情" name="third">
          <div class="singerDesc">{{ singerInfo.briefDesc }}</div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <go-top scrollObj=".singerDetail"></go-top>
  </div>
</template>

<script>
import { handleMusicTime } from "plugins/utils";
import ListTable from "components/listTable/ListTable.vue";
import VideoListCard from "components/videoListCard/VideoListCard.vue";
import GoTop from "components/goTop/GoTop.vue";

// 记录上一首播放的音乐信息  用于清空小喇叭和红字样式
let currentRowInfo = {};
// 定时器名称
let timer;

export default {
  components: { ListTable, VideoListCard, GoTop },
  name: "SingerDetail",
  data() {
    return {
      singerInfo: {},
      // 热门50首
      topSongs: {},
      // 歌手专辑
      singerAlbum: [],
      // 专辑页数
      albumPage: 1,
      disabled: true,
      isAlbumMore: false,
      // 是否显示topSong的查看全部按钮
      isCheckAllShow: true,
      // 歌手mv数据
      singerMvInfo: { mvs: [], hasMore: false },
      // mv页数
      videoPage: 1,
      // 是否是双击操作
      isDbc: false,
      // 是否收藏了当前歌手
      isSub: false,
    };
  },
  methods: {
    // 请求
    // 请求歌手详情
    async getSingerInfo() {
      let res = await this.$request("/artist/detail", {
        id: this.$route.params.id,
      });
      // console.log(res);
      this.singerInfo = res.data.data.artist;
    },
    // 请求歌手热门50首歌曲
    async getSingerTopSongs() {
      let res = await this.$request("/artist/top/song", {
        id: this.$route.params.id,
      });
      // console.log(res);
      let topSongs = res.data.songs;
      // 处理歌单中歌曲的时间
      topSongs.forEach((item, index) => {
        topSongs[index].dt = handleMusicTime(item.dt);
      });
      // topSongs改成对象，并向里面添加isOpen属性，用于点击查看列表所有歌曲
      this.topSongs = { topSongs, isOpen: false };
    },
    // 请求专辑列表 再用专辑id查询专辑信息
    async getAlbumInfo() {
      let res = await this.$request("/artist/album", {
        id: this.$route.params.id,
        limit: 20,
        offset: (this.albumPage - 1) * 20,
      });
      this.isAlbumMore = res.data.more;
      res = res.data.hotAlbums;
      await res.forEach((item) => {
        this.getAlbumDetail(item.id);
      });
      // console.log("拿到了专辑数据并保存", this.singerAlbum);
    },
    // 请求专辑详情信息
    async getAlbumDetail(id) {
      let res = await this.$request("/album", { id });
      // 将数组songs再保存一个对象格式，方便组件使用
      res = res.data;
      let songs = res.songs;
      // 处理歌单中歌曲的时间
      songs.forEach((item, index) => {
        songs[index].dt = handleMusicTime(item.dt);
      });
      res.songsObj = { songs };
      this.singerAlbum.push(res);
    },
    // 请求歌手 mv 数据
    async getSingerMv() {
      // 这个接口没有offset 参数
      let res = await this.$request("/artist/mv", {
        id: this.$route.params.id,
        limit: 20 * this.videoPage,
      });
      console.log(res);
      this.singerMvInfo = res.data;
    },
    // 请求收藏的歌手列表
    async getSubSingerList() {
      let timestamp = Date.parse(new Date());
      let res = await this.$request("/artist/sublist", {
        limit: 1000,
        timestamp,
      });
      console.log(res.data.data);
      this.$store.commit("updateSubSingerList", res.data.data);
    },

    // 事件函数
    // 行点击事件的回调
    handleRowClick(event) {
      // console.log(event);
      if (document.querySelector(".selectRow")) {
        document.querySelector(".selectRow").classList.remove("selectRow");
      }
      event.classList.add("selectRow");
    },

    // 行双击事件的回调
    // 这里的 id是歌曲id   index 双击歌曲在歌单中的索引   listId是歌单id
    handleRowDbClick({ id, index, listId }) {
      // console.log(id);
      // console.log(index);
      // console.log(listId);
      this.isDbc = true;

      this.handleViewDOM(id, listId, index);

      // 播放的逻辑操作
      if (listId != this.$route.params.id) {
        let musicListIndex = this.singerAlbum.findIndex(
          (item) => item.album.id == listId
        );
        // console.log(musicListIndex);
        this.$store.commit("updateMusicId", id);
        // 如果歌单发生变化,则提交歌单到vuex
        if (listId != this.$store.state.musicListId) {
          // 将歌单传到vuex
          this.$store.commit("updateMusicList", {
            musicList: this.singerAlbum[musicListIndex].songs,
            musicListId: listId,
          });
        }
      } else {
        this.$store.commit("updateMusicId", id);
        // 如果歌单发生变化,则提交歌单到vuex
        // 如果是topsong 就拿歌手的id 当作listid 作为唯一辨识
        if (this.$route.params.id != this.$store.state.musicListId) {
          // 将歌单传到vuex
          this.$store.commit("updateMusicList", {
            musicList: this.topSongs.topSongs,
            musicListId: this.$route.params.id,
          });
        }
      }
      // console.log(123);
    },

    handleViewDOM(id, listId, index) {
      // 先清空之前的样式
      if (currentRowInfo.listId) {
        this.cleanStyle(currentRowInfo.i, currentRowInfo.listId);
      }
      let tables = document.querySelectorAll("table");
      // 这里的 id是歌曲id   index 双击歌曲在歌单中的索引   listId是歌单id
      let i = -1;
      // 根据listId找歌单索引 listIndex
      let listIndex = -1;
      // top50的情况
      if (listId == this.$route.params.id) {
        listIndex = 0;
      } // 专辑的情况
      else {
        listIndex = this.singerAlbum.findIndex(
          (item) => item.album.id == listId
        );
        console.log(listIndex, "listIndex");
        // 如果没有，说明目前还没有渲染或者还没有请求
        if (listIndex == -1) {
          console.log("can not find listIndex");
          return;
        }
        listIndex += 1;
      }

      // 找歌曲在歌单中的索引 i
      if (index == undefined) {
        // 分top50和专辑两种情况
        if (listIndex == 0) {
          i = this.topSongs.topSongs.findIndex((item) => item.id == id);
        } else {
          i = this.singerAlbum[listIndex - 1].songs.findIndex(
            (item) => item.id == id
          );
        }
      } else {
        i = index;
      }

      console.log(i, "i");
      console.log(index, "index");
      // 渲染
      if (tables[listIndex] && tables[listIndex].children[i]) {
        let currentRow = tables[listIndex].children[i];
        // console.log(currentRow);
        currentRow.querySelector(".index").innerHTML =
          "<i class='iconfont icon-yinliang' style='color:#ff4e4e'></i>";
        currentRow.querySelector(".musicName").style.color = "#ff4e4e";

        // 保存当前数据 供下次清空样式使用
        currentRowInfo.i = i;
        // 因为歌单的顺序可能会改变，所以不要直接保存索引
        currentRowInfo.listId = listId;
        currentRowInfo.singerId = this.$route.params.id;
        // 将currentRowInfo上传至vuex 供下次重新进入页面使用
        this.$store.commit("updateCurrentRowInfo", currentRowInfo);
      }
    },

    cleanStyle(i, listId) {
      let tables = document.querySelectorAll("table");
      // 找到歌单的索引
      let listIndex = -1;
      if (listId == this.$route.params.id) {
        listIndex = 0;
      } // 专辑的情况
      else {
        listIndex = this.singerAlbum.findIndex(
          (item) => item.album.id == listId
        );
        // 如果没有，说明目前还没有渲染或者还没有请求
        if (listIndex == -1) {
          console.log("can not find listIndex");
          return;
        }
        listIndex += 1;
      }
      // console.log("执行了清空");
      // console.log("listIndex:", listIndex);
      // console.log("i:", i);
      if (tables[listIndex] && tables[listIndex].children[i]) {
        let lastRow = tables[listIndex].children[i];
        lastRow.querySelector(".index").innerHTML = i + 1;
        lastRow.querySelector(".musicName").style.color = "";
      }
    },

    // 点击榜单进入歌单详情界面
    clickListCardItem({ listId }) {
      console.log(listId);
      this.$router.push({ name: "album", params: { id: listId } });
      // this.$router.push({ name: "musicListDetail", params: { id } });
      // console.log(123);
    },
    // 查看热门50首全部歌曲
    allTopSongs() {
      this.topSongs.isOpen = true;
      this.isCheckAllShow = false;
      // 查看全部后再次渲染样式
      setTimeout(() => {
        if (
          this.$store.state.currentRowInfo.singerId == this.$route.params.id
        ) {
          this.handleViewDOM(
            this.$store.state.musicId,
            this.$store.state.musicListId
          );
        }
      }, 500);
    },
    // 专辑上拉触底加载
    load() {
      // console.log("上拉触底");
      this.disabled = true;
      this.albumPage += 1;
      this.getAlbumInfo();
    },

    // mv上拉加载
    bottomLoad() {
      if (this.singerMvInfo.hasMore == true) {
        this.videoPage += 1;
        this.getSingerMv();
      }
    },
    // 点击视频卡片进入视频详情
    goToVideoDetail({ id }) {
      if (!this.$store.state.isLogin) {
        this.$message.error("登录后才能观看MV哦!");
        return;
      }
      // console.log(id);
      this.$router.push({ name: "videoDetail", params: { id, type: "mv" } });
    },
    // 点击el-tab-pane的回调
    clickTab(e) {
      console.log(e.index);
      if (e.index == 1 && this.singerMvInfo.mvs.length == 0) {
        this.getSingerMv();
      }
    },
    // 判断用户是否收藏了该歌手
    getIsSub() {
      this.isSub = this.$store.state.subSingerList.find(
        (item) => item.id == this.$route.params.id
      );
    },
    // 点击subSinger按钮的回调
    async subSinger() {
      if (!this.$store.state.isLogin) {
        this.$message.error("请先登录!");
        return;
      }
      this.isSub = !this.isSub;
      // 发送请求
      await this.$request("/artist/sub", {
        id: this.$route.params.id,
        t: this.isSub ? 1 : 0,
      });
      // 每次进行修改操作后，都需要更新vuex里面的收藏list
      this.getSubSingerList();
    },
  },
  created() {
    this.getSingerInfo();
  },
  watch: {
    singerAlbum() {
      if (this.singerAlbum.length != 0 && this.isAlbumMore) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },
    // 音乐加载完成后重置isDbc
    "$store.state.isMusicLoad"(isMusicLoad) {
      if (!isMusicLoad) {
        this.isDbc = false;
      }
    },

    "$store.state.musicId"(current, last) {
      // 判断是否是双击，如果是双击则不用调用handleView
      if (!this.isDbc) {
        // id,listId
        this.handleViewDOM(
          this.$store.state.musicId,
          this.$store.state.musicListId
        );
      }
    },

    // 监听singerAlbum的变化
    singerAlbum() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (
          this.$store.state.currentRowInfo.singerId == this.$route.params.id
        ) {
          this.handleViewDOM(
            this.$store.state.musicId,
            this.$store.state.musicListId
          );
        }
      }, 500);
    },
  },
  async mounted() {
    await this.getSingerTopSongs();
    await this.getAlbumInfo();
    this.$nextTick(() => {
      if (this.$store.state.currentRowInfo.singerId == this.$route.params.id) {
        this.handleViewDOM(
          this.$store.state.musicId,
          this.$store.state.musicListId
        );
      }
    });
    if (this.$store.state.isLogin) {
      if (this.$store.state.subSingerList == null) {
        await this.getSubSingerList();
      }
      this.getIsSub();
    }
  },
};
</script>

<style scoped>
.singerDetail {
  overflow-y: scroll;
  background: #16181c;
}

.listInfo {
  display: flex;
  padding: 25px 10px;
}

.listAvatar {
  width: 150px;
  height: 150px;
  overflow: hidden;
  border-radius: 10px;
  margin-right: 15px;
}

.listAvatar img {
  width: 100%;
}

.right {
  margin-top: 10px;
  width: calc(100% - 200px);
}

.title {
  display: flex;
  align-items: center;
}

.titleTag {
  font-size: 12px;
  color: #ec4141;
  border: 1px solid #ec4141;
  padding: 1px 2px;
  border-radius: 2px;
  margin-right: 5px;
  transform: scale(0.8);
}

.titleContent {
  font-size: 20px;
  font-weight: 600;
  color: #cccccc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 90%;
}

.buttons {
  margin: 15px 0 0 -5px;
  display: flex;
}

.buttonItem {
  font-size: 12px;
  padding: 8px 15px;
  border-radius: 5px;
  transform: scale(0.9);
  color: #cccccc;
}

.buttonItem i {
  font-size: 12px;
  margin-right: 3px;
  transform: scale(0.9);
}

.playAll {
  background-color: #ec4141;
  color: white;
}

.otherInfo {
  margin: 15px 0 0 -30px;
  display: flex;
  font-size: 12px;
  transform: scale(0.9);
  color: #cccccc;
}

.musicNum {
  margin-right: 13px;
}

.musicList {
  margin: 0 10px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #cccccc;
  margin-bottom: 10px;
}

.singerDesc {
  font-size: 12px;
  color: #cccccc;
  line-height: 25px;
  letter-spacing: 0.5px;
  text-indent: 2em;
}

.red {
  color: #ec4141;
}
::v-deep .el-tabs__item.is-active{
  color: #b82525 !important;
}
::v-deep .el-tabs__item{
  color: #cccccc;
}
::v-deep .el-tabs__item:hover{
  color: #b82525 !important;
}
.buttons .bg{
  background-color: #202023;
}
</style>