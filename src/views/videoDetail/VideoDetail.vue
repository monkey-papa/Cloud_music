<template>
  <div class="videoDetail" v-if="videoUrl">
    <div class="left">
      <div class="title">
        {{ $route.params.type == "mv" ? "MV详情" : "视频详情" }}
      </div>
      <video
        class="videoPlayer"
        :src="videoUrl"
        controls
        width="496px"
        height="284px"
        @play="playVideo"
        :poster="
          $route.params.type == 'mv' ? videoInfo.cover : videoInfo.coverUrl
        "
      ></video>
      <!-- 视频详情信息 -->
      <div
        class="videoInfo"
        v-if="$route.params.type == 'mv' ? videoInfo.cover : videoInfo.coverUrl"
      >
        <div class="user">
          <div class="avatar">
            <img
              @click="goToPersonal()"
              :src="
                ($route.params.type == 'mv'
                  ? videoInfo.artists[0].img1v1Url
                  : videoInfo.avatarUrl) + '?param=100y100'
              "
              alt=""
            />
          </div>
          <div class="userName" @click="goToPersonal()">
            {{
              $route.params.type == "mv"
                ? videoInfo.artists[0].name
                : videoInfo.creator.nickname
            }}
          </div>
        </div>
        <div class="videoTitle">
          {{ $route.params.type == "mv" ? videoInfo.name : videoInfo.title }}
        </div>
        <div class="otherInfo">
          <div>
            发布：{{
              $route.params.type == "mv"
                ? videoInfo.publishTime
                : videoInfo.publishTime | showDate
            }}
          </div>
          <div>
            播放：{{
              ($route.params.type == "mv"
                ? videoInfo.playCount
                : videoInfo.playTime) | handleNum
            }}
          </div>
        </div>
        <div class="buttons">
          <div class="buttonItem" @click="likeVideo">
            <i class="iconfont icon-good" :class="isLike ? 'red' : ''"></i
            >{{ isLike ? "已赞" : "赞" }}
          </div>
          <div class="buttonItem" @click="subVideo">
            <i class="iconfont icon-xihuan" :class="isSub ? 'red' : ''"></i
            >{{ isSub ? "已收藏" : "收藏" }}
          </div>
          <div class="buttonItem">
            <i class="iconfont icon-zhuanfa"></i>分享
          </div>
        </div>
      </div>
      <!-- 视频评论 -->
      <div class="comment">
        <div class="title commentTitle">评论</div>
        <div class="commentList" v-loading="isCommentLoading">
          <!-- 精彩评论 -->
          <comment
            :comments="comments.hotComments"
            v-if="comments.hotComments"
            :commentType="$route.params.type == 'mv' ? 'mv' : 'video'"
            :commentId="$route.params.id + ''"
            @getComment="
              $route.params.type == 'mv' ? getMvComment() : getVideoComment()
            "
            @scrollToComment="scrollToComment"
            ref="hotComments"
            ><div slot="title">精彩评论</div></comment
          >
          <!-- 最新评论 -->
          <comment
            :comments="comments.comments"
            :commentType="$route.params.type == 'mv' ? 'mv' : 'video'"
            :commentId="$route.params.id + ''"
            :isHotComment="comments.hotComments ? false : true"
            @getComment="
              $route.params.type == 'mv' ? getMvComment() : getVideoComment()
            "
            @scrollToComment="scrollToComment"
            @transToHotComment="
              (info) =>
                $refs.hotComments.floorComment(info.commentId, info.nickName)
            "
            ><div slot="title">最新评论</div></comment
          >
        </div>
        <!-- 分页 -->
        <div class="page">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="comments.total"
            small
            :page-size="20"
            :current-page="commentsPage"
            @current-change="commentPageChange"
          >
          </el-pagination>
        </div>
      </div>
    </div>
    <!-- 相关推荐 -->
    <div class="right" v-if="relatedVideo.length != 0">
      <div class="title">相关推荐</div>
      <div
        class="relatedVideoItem"
        v-for="(item, index) in relatedVideo"
        :key="index"
        @click="goToRelatedVideo(item.vid)"
      >
        <div class="relatedVideoItemCover">
          <img :src="item.coverUrl + '?param=300y180'" alt="" />
          <div class="relatedVideoItemPlayCount">
            <i class="iconfont icon-shipin"></i> {{ item.playTime | handleNum }}
          </div>
          <div class="relatedVideoItemTime">
            {{ item.durationms | handleMusicTime }}
          </div>
        </div>
        <div class="relatedVideoItemInfo">
          <div class="relatedVideoItemTitle">{{ item.title }}</div>
          <div class="creator">by {{ item.creator[0].userName }}</div>
        </div>
      </div>
    </div>
    <!-- 返回顶部 -->
    <go-top scrollObj=".videoDetail"></go-top>
  </div>
</template>

<script>
import { handleNum, handleMusicTime, formatDate } from "plugins/utils.js";
import Comment from "components/comment/Comment.vue";
import GoTop from "components/goTop/GoTop.vue";

export default {
  components: { Comment, GoTop },
  name: "VideoDetail",
  data() {
    return {
      videoInfo: {},
      videoUrl: "",
      // 相关视频数据
      relatedVideo: [],
      comments: {},
      // 评论页数
      commentsPage: 1,
      // 用户是否收藏该视频
      isSub: false,
      // 是否正在加载评论
      isCommentLoading: false,
      // 用户是否喜欢该视频
      isLike: false,
    };
  },
  methods: {
    // 请求
    // 根据传来的id查询mv详情
    async getMvDetail() {
      let res = await this.$request("/mv/detail", {
        mvid: this.$route.params.id,
      });
      //   console.log(res);
      this.videoInfo = res.data.data;
    },
    // 请求mv地址
    async getMvUrl() {
      let res = await this.$request("/mv/url", { id: this.$route.params.id });
      this.videoUrl = res.data.data.url;
    },
    // 请求相关视频
    async getRelatedVideo() {
      let res = await this.$request("/related/allvideo", {
        id: this.$route.params.id,
      });
      console.log(res);
      this.relatedVideo = res.data.data;
    },
    // 请求mv评论数据
    async getMvComment(type) {
      // 获取时间戳
      var timestamp = Date.parse(new Date());
      this.isCommentLoading = true;
      // 清空最新评论数据
      // this.comments.comments = [];

      if (type == "changePage") {
        this.scrollToComment();
      }

      let res = await this.$request("/comment/mv", {
        id: this.$route.params.id,
        offset: 20 * (this.commentsPage - 1),
        timestamp,
      });

      //   console.log(res);
      if (res.data.code !== 200) {
        this.$message.error("获取评论失败,请稍后重试!");
        return;
      }
      this.comments = res.data;
      this.isCommentLoading = false;
    },

    // 滚动到输入框
    scrollToComment() {
      let videoDetail = document.querySelector(".videoDetail");
      let commentTitle = document.querySelector(".commentTitle");
      // console.log([commentTitle]);
      videoDetail.scrollTo({
        behavior: "smooth",
        top: commentTitle.offsetTop - 70,
      });
    },

    // 请求视频详情
    async getVideoDetail() {
      console.log(this.$route.params);
      let res = await this.$request("/video/detail", {
        id: this.$route.params.id,
      });
      this.videoInfo = res.data.data;
      console.log(res);
    },
    // 获取视频播放地址
    async getVideoUrl() {
      let res = await this.$request("/video/url", {
        id: this.$route.params.id,
      });
      //   console.log(res);
      this.videoUrl = res.data.urls[0].url;
    },
    // 获取视频评论
    async getVideoComment(type) {
      // 获取时间戳
      var timestamp = Date.parse(new Date());
      this.isCommentLoading = true;

      // 清空最新评论数据
      // this.comments.comments = [];

      if (type == "changePage") {
        let videoDetail = document.querySelector(".videoDetail");
        let commentTitle = document.querySelector(".commentTitle");
        // console.log([commentTitle]);
        videoDetail.scrollTo({
          behavior: "smooth",
          top: commentTitle.offsetTop - 70,
        });
      }

      let res = await this.$request("/comment/video", {
        id: this.$route.params.id,
        offset: 20 * (this.commentsPage - 1),
        timestamp,
      });

      this.isCommentLoading = false;
      //   console.log(res);
      if (res.data.code !== 200) {
        this.$message.error("获取评论失败,请稍后重试!");
        return;
      }
      this.comments = res.data;
    },
    // 请求用户收藏的视频列表
    async getSubVideoList() {
      let timestamp = Date.parse(new Date());
      let res = await this.$request("/mv/sublist", { limit: 1000, timestamp });
      if (res.data.code != 200) {
        this.$message.error("获取用户收藏视频失败,请稍后重试!");
        return;
      }
      this.$store.commit("updateSubVideoList", res.data.data);
      console.log("请求了用户收藏的视频列表");
    },

    // 请求用户喜欢的视频列表
    async getLikeVideoList() {
      let timestamp = Date.parse(new Date());
      let res = await this.$request("/playlist/mylike", {
        limit: 1000,
        timestamp,
      });
      console.log(res);
      if (res.data.code != 200) {
        this.$message.error("获取用户点赞视频失败,请稍后重试!");
        return;
      }
      this.$store.commit("updateLikeVideoList", res.data.data.feeds);
      console.log("请求了用户喜欢的视频列表");
    },

    // 事件处理
    // 评论点击翻页的回调
    commentPageChange(page) {
      this.commentsPage = page;
      // 清空评论
      // this.comments.comments = [];
      if (this.$route.params.type == "mv") {
        this.getMvComment("changePage");
      } else if (this.$route.params.type == "video") {
        this.getVideoComment("changePage");
      }
    },
    // 点击推荐视频的回调
    goToRelatedVideo(id) {
      //   console.log(id);
      this.$router.push({ name: "videoDetail", params: { id, type: "video" } });
    },
    // 监听vidoe播放的事件
    playVideo() {
      this.$store.commit("changePlayState", false);
    },
    // 判断用户是否收藏了该视频
    getIsSub() {
      console.log(this.isSub);
      this.isSub = this.$store.state.subVideoList.find(
        (item) => item.vid == this.$route.params.id
      );
    },

    // 判断用户是否喜欢了该视频
    getIsLike() {
      if (this.$route.params.type == "mv") {
        this.isLike = this.$store.state.likeVideoList.find(
          (item) => item.mlogBaseData.id == this.$route.params.id
        );
      } else {
        // 因为请求的喜欢列表中的视频id是mlogid 要获取vid还需要另外单独请求  这里我直接对比标题和时长 若都对的上则认定为是同一个视频
        this.isLike = this.$store.state.likeVideoList.find(
          (item) =>
            item.mlogBaseData.desc == this.videoInfo.description &&
            item.mlogBaseData.dration == this.videoInfo.durationms
        );
      }
    },

    // 用户点击了收藏按钮的回调
    async subVideo() {
      this.isSub = !this.isSub;
      var timestamp = Date.parse(new Date());

      // 请求
      if (this.$route.params.type == "video") {
        await this.$request("/video/sub", {
          id: this.$route.params.id,
          t: this.isSub ? 1 : 0,
        });
      } else {
        await this.$request("/mv/sub", {
          mvid: this.$route.params.id,
          t: this.isSub ? 1 : 0,
          timestamp,
        });
      }
      this.getSubVideoList();
    },

    // 用户点击了点赞按钮的回调
    async likeVideo() {
      this.isLike = !this.isLike;
      var timestamp = Date.parse(new Date());
      let type = this.$route.params.type == "mv" ? 1 : 5;
      // 请求
      let res = await this.$request("/resource/like", {
        type,
        id: this.$route.params.id,
        t: this.isLike ? 1 : 0,
        timestamp,
      });
      console.log(res);
      this.getLikeVideoList();
    },

    // 点击跳转至personal页面的回调
    goToPersonal() {
      let uid =
        this.$route.params.type == "mv"
          ? this.videoInfo.artists[0].id
          : this.videoInfo.creator.userId;
      if (this.$route.params.type == "mv") {
        this.$router.push({ name: "singerDetail", params: { id: uid } });
      } else {
        this.$router.push({ name: "personal", params: { uid } });
      }
    },
  },
  async created() {
    this.getRelatedVideo();
    if (this.$route.params.type == "mv") {
      await this.getMvDetail();
      this.getMvUrl();
      this.getMvComment();
    } else if (this.$route.params.type == "video") {
      await this.getVideoDetail();
      this.getVideoUrl();
      this.getVideoComment();
    }

    if (this.$store.state.subVideoList == null) {
      await this.getSubVideoList();
    }
    this.getIsSub();
    if (this.$store.state.likeVideoList == null) {
      await this.getLikeVideoList();
    }
    this.getIsLike();
  },
  filters: {
    handleNum,
    handleMusicTime,
    showDate(value) {
      // 1、先将时间戳转成Date对象
      const date = new Date(value);

      // 2、将date进行格式化
      return formatDate(date, "yyyy-MM-dd");
    },
  },
  watch: {
    // 路由push相同地址不同参数时 不会自动刷新页面，这里通过watch监听路由变化，一但发生变化就通过 go(0) 刷新
    // $route(to, from) {
    //   if (to !== from) {
    //     // 直接 go会导致整个页面进行刷新
    //     // this.$router.go(0);
    //   }
    // },
  },
};
</script>

<style scoped>
.videoDetail {
  display: flex;
  justify-content: center;
  height: calc(80vh - 105px);
  overflow-y: scroll;
}

.left {
  width: 500px;
}

.right {
  margin-left: 20px;
}

.title {
  margin: 10px 0;
  color: #cccccc;
  font-weight: 600;
}

.relatedVideoItem {
  display: flex;
  margin-bottom: 5px;
  cursor: pointer;
}

.relatedVideoItemCover {
  position: relative;
  margin-right: 10px;
}

.relatedVideoItemCover img {
  width: 150px;
  height: 90px;
  border-radius: 10px;
}

.relatedVideoItemPlayCount {
  position: absolute;
  top: 0;
  right: 5px;
  font-size: 12px;
  color: white;
  transform: scale(0.9);
}

.relatedVideoItemTime {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 12px;
  color: white;
  transform: scale(0.9);
}

.relatedVideoItemInfo {
  font-size: 12px;
  color: rgb(31, 30, 30);
  margin: 12px 0;
  width: 140px;
}

.relatedVideoItemTitle {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #cccccc;
}

.creator {
  color: #cccccc;
  margin-top: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: scale(0.9) translateX(-5%);
}

.user {
  display: flex;
  margin: 10px 0;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
}

.avatar img {
  width: 100%;
  border-radius: 50%;
  cursor: pointer;
}

.userName {
  font-size: 12px;
  margin-left: 10px;
  color: #cccccc;
  cursor: pointer;
}

.videoTitle {
  color: #cccccc;
  font-size: 20px;
  margin: 20px 0 10px;
  font-weight: bold;
}

.otherInfo {
  display: flex;
  color: #aaa;
  font-size: 12px;
}

.otherInfo div {
  margin-right: 20px;
  transform: scale(0.9) translateX(-5%);
}

.buttons {
  display: flex;
  font-size: 12px;
  margin: 20px 0;
  color: #ccc;
}

.buttonItem {
  padding: 5px 20px;
  border: 1px solid #202023;
  border-radius: 5px;
  margin-right: 10px;
  background: #202023;
}

.buttonItem i {
  font-size: 12px;
  margin-right: 3px;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
}

.videoPlayer {
  background-color: black;
}

.red {
  color: #ec4141;
}

.videoDetail /deep/ .el-loading-spinner {
  top: 40px;
}
</style>