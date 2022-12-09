<template>
  <div class="recommendMusic">
    <!-- 每日推荐歌曲信息 -->
    <div class="recommendInfo">
      <div class="title">
        <div class="cover">
          <img src="~assets/img/recommendMusic.png" alt="" />
        </div>
        <div class="titleInfo">
          <div class="infoTop">每日歌曲推荐</div>
          <div class="infoBottom">根据你的音乐口味生成，每天6:00更新</div>
        </div>
      </div>
      <!-- 操作按钮 -->
      <div class="buttons">
        <div class="buttonItem playAll" @click="playAll">
          <i class="iconfont icon-bofang playAll"></i>
          <span>播放全部</span>
        </div>
        <div class="buttonItem">
          <i class="iconfont icon-xihuan"></i>
          <span>收藏全部</span>
        </div>
      </div>
    </div>
    <!-- 歌曲列表 -->
    <div v-if="recommendMusic.length != 0">
      <!-- 表格 -->
      <el-table
        :data="recommendMusic"
        size="mini"
        style="width: 100%"
        @row-dblclick="clickRow"
        @cell-click="clickCell"
        highlight-current-row
        lazy
        :cell-style="{background:'#202023'}"
      >
        <el-table-column label="" width="30" type="index" :index="handleIndex">
        </el-table-column>
        <el-table-column label="" width="23">
          <!-- 下载按钮 -->
          <i class="iconfont icon-download"></i>
        </el-table-column>
        <el-table-column prop="name" label="音乐标题" min-width="350">
        </el-table-column>
        <el-table-column prop="ar[0].name" label="歌手" min-width="120">
        </el-table-column>
        <el-table-column prop="al.name" label="专辑" min-width="170">
        </el-table-column>
        <el-table-column prop="dt" label="时长" min-width="100">
        </el-table-column>
      </el-table>
      <div class="placeholder"></div>
    </div>
  </div>
</template>

<script>
import { handleMusicTime } from "plugins/utils";

export default {
  name: "RecommendMusic",
  data() {
    return {
      // 每日推荐歌曲列表
      recommendMusic: [],
      //   每日推荐id （自己起的，用于上传vuex当musicListId，只是作为一个唯一标识）
      recommendMusicListId: "recommendMusic",
    };
  },
  methods: {
    //   请求
    // 获取每日推荐歌曲
    async getRecommendMusic() {
      let res = await this.$request("/recommend/songs");
      this.recommendMusic = res.data.data.dailySongs;
      // 处理时间
      this.recommendMusic.forEach((item, index) => {
        this.recommendMusic[index].dt = handleMusicTime(item.dt);
      });
    },

    // 事件
    // 点击播放全部按钮的回调
    playAll() {
      console.log(this.recommendMusic);
      this.$store.commit("updateMusicId", this.recommendMusic[0].id);
      this.$store.commit("updateMusicList", {
        musicList: this.recommendMusic,
        musicListId: this.recommendMusicListId,
      });
    },
    // 处理table索引
    handleIndex(index) {
      // console.log(index);
      index += 1;
      if (index < 10) {
        return "0" + index;
      } else {
        return index;
      }
    },
    // 双击table的row的回调
    // 播放音乐的逻辑操作
    async clickRow(row) {
      // console.log(row);
      // 将musicId提交到vuex中 供bottomControl查询歌曲url和其它操作
      this.$store.commit("updateMusicId", row.id);
      // 如果歌单发生变化,则提交歌单到vuex
      if (this.recommendMusicListId != this.$store.state.musicListId) {
        // 将歌单传到vuex
        this.$store.commit("updateMusicList", {
          musicList: this.recommendMusic,
          musicListId: this.recommendMusicListId,
        });
      }
    },

    // 操作 DOM
    handleDOM(current, last) {
      if (document.querySelector(".recommendMusic")) {
        let tableRows = document
          .querySelector(".recommendMusic")
          .querySelectorAll(".el-table__row");
        // 遍历当前musicList 找到当前播放的index的行进行渲染
        // console.log(tableRows);
        let index = this.recommendMusic.findIndex((item) => item.id == current);
        // console.log(index);
        if (index != -1) {
          // 直接修改dom样式的颜色无效
          // 通过引入全局样式解决
          // 将正在播放的音乐前面的索引换成小喇叭
          tableRows[index].children[0].querySelector(
            ".cell"
          ).innerHTML = `<div><i class="iconfont icon-yinliang"></i></div>`;
          tableRows[index].children[0]
            .querySelector(".iconfont")
            .classList.add("currentRow");
          tableRows[index].children[2]
            .querySelector(".cell")
            .classList.add("currentRow");
          tableRows[index].children[3]
            .querySelector(".cell")
            .classList.add("currentRow");
        }
        // 清除上一首的样式
        if (last != -1) {
          let lastIndex = this.recommendMusic.findIndex(
            (item) => item.id == last
          );
          if (lastIndex != -1) {
            // 将上一个播放的dom的小喇叭换回索引
            tableRows[lastIndex].children[0].querySelector(
              ".cell"
            ).innerHTML = `<div>${
              lastIndex + 1 < 10 ? "0" + (lastIndex + 1) : lastIndex + 1
            }</div>`;

            // 将上一首的类名删掉  小喇叭的html已经被替换了，不需要再还原
            tableRows[lastIndex].children[2]
              .querySelector(".cell")
              .classList.remove("currentRow");
            tableRows[lastIndex].children[3]
              .querySelector(".cell")
              .classList.remove("currentRow");
          }
        }
      }
    },

    async clickCell(row, column, cell) {
      // 判断点击的是下载按钮
      if (cell.querySelector(".icon-download")) {
        // 请求该歌曲的url
        console.log(row);
        let res = await this.$request("/song/url", { id: row.id });
        console.log(res.data.data[0].url);
        console.log(res);
        if (res.data.data[0].url == null) {
          this.$message.warning("暂时无法获取该资源哦!");
          return;
        }

        // 匹配资源的域名
        let url = res.data.data[0].url.match(/\http.*?\.net/);
        // 匹配域名名称，并匹配对应的代理
        let serve = url[0].match(/http:\/(\S*).music/)[1];
        if (
          serve != "/m7" &&
          serve != "/m701" &&
          serve != "/m8" &&
          serve != "/m801"
        ) {
          // 没有对应的代理
          this.$message.error("匹配不到对应的代理,下载失败!");
          return;
        }
        // 截取后面的参数
        let params = res.data.data[0].url.slice(url[0].length);
        // console.log(url[0], serve, params);

        let downloadMusicInfo = {
          url: serve + params,
          name:
            row.name +
            " - " +
            row.ar[0].name +
            "." +
            res.data.data[0].type.toLowerCase(),
        };
        console.log(downloadMusicInfo);
        this.$store.commit("updateDownloadMusicInfo", downloadMusicInfo);
      }
    },
  },
  created() {
    if (!this.$store.state.isLogin) {
      this.$message.error("只有登录后才能进入每日推荐页面哦!");
      this.$router.replace("/discover");
    }
  },
  async mounted() {
    if (this.$store.state.isLogin) {
      await this.getRecommendMusic();
      // 判断是否和上一次打开的歌单相同
      if (this.recommendMusicListId == this.$store.state.musicListId) {
        this.handleDOM(this.$store.state.musicId);
      }
    }
  },
  watch: {
    "$store.state.musicId"(current, last) {
      this.handleDOM(current, last);
    },
  },
};
</script>

<style scoped>
.recommendInfo {
  padding: 20px;
}

.title {
  display: flex;
}

.cover {
  width: 90px;
}

.cover img {
  width: 100%;
}

.titleInfo {
  padding: 15px 10px;
}

.infoTop {
  font-size: 19px;
  font-weight: bold;
  color: #cccccc;
  margin: 3px 0;
}

.infoBottom {
  font-size: 12px;
}

.buttons {
  margin: 8px 0 0 3px;
  display: flex;
}

.buttonItem {
  font-size: 12px;
  padding: 8px 15px;
  border-radius: 5px;
  transform: scale(0.9);
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

.placeholder {
  width: 100%;
  height: 50px;
}
::v-deep .el-table__row td:nth-child(3) .cell{
  color: #808080 !important;
}
::v-deep .el-table th.el-table__cell{
  background-color: #16181c !important;
}
::v-deep .el-table::before{
  background: #16181c;
}
/* 音乐标题的灰色 */
::v-deep .el-table__row td:nth-child(3) .cell{
  color: #949494 !important;
}
::v-deep .el-table__row td:nth-child(1) .cell{
  color: #949494 !important;
}
::v-deep .el-table__row td:nth-child(4) .cell{
  color: #949494 !important;
}
::v-deep .el-table__row td:nth-child(5) .cell{
  color: #949494 !important;
}
::v-deep .el-table__row td:nth-child(6) .cell{
  color: #949494 !important;
}
/* 点击音乐后的音乐标题的红色 */
::v-deep .el-table__row td:nth-child(3) .currentRow{
  color: #ec4141 !important;
}
::v-deep .el-table__row td:nth-child(4) .currentRow{
  color: #ec4141 !important;
}
</style>