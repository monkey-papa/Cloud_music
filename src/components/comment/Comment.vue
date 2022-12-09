<template>
<!-- 音乐单曲评论 -->
  <div class="hotComments">
    <div
      class="comments"
      v-if="commentType != '' && commentType != 'music' && isHotComment"
    >
      <el-input
        type="textarea"
        class="commentArea"
        maxlength="140"
        show-word-limit
        v-model="commentInput"
        placeholder="留下你的评论"
        @input="inputComment"
      ></el-input>
      <div class="submitCommentButton">
        <el-button
          size="mini"
          @click="commentMode ? submitComment() : submitFloorComment()"
          class="submitComment"
          >评论</el-button
        >
      </div>
    </div>
    <!-- 音乐单曲评论 -->
    <div
      class="musicComment"
      v-else-if="commentType != '' && commentType == 'music'"
    >
      <el-button class="commentCardSwitch" size="mini" round @click="openDialog"
        ><i class="iconfont icon-ziyuan"></i> 发表我的评论</el-button
      >
      <el-dialog
        :visible="isCommentDialogShow"
        width="400px"
        @close="closeCommentDialog"
        append-to-body
        class="commentDialog"
      >
        <div class="musicTitle">歌曲：{{ musicTitle }}</div>
        <el-input
          type="textarea"
          class="commentArea musicCommentArea"
          maxlength="140"
          show-word-limit
          v-model="commentInput"
          @input="inputComment"
          placeholder="留下你的评论"
        ></el-input>
        <!-- 提交评论 -->
        <div class="submitCommentButton">
          <el-button
            size="mini"
            round
            @click="commentMode ? submitComment() : submitFloorComment()"
            class="submitComment musicSubmitComment"
            >评论</el-button
          >
        </div>
      </el-dialog>
    </div>
    <div class="commentHeader"><slot name="title"></slot></div>
    <div class="commentItem" v-for="(item, index) in comments" :key="index">
      <div class="commentCreatorAvatar">
        <img
          :src="item.user.avatarUrl + '?param=100y100'"
          alt=""
          @click="goToPersonal(item.user.userId)"
        />
      </div>
      <div class="commentMain">
        <div class="commentContent">
          <span
            class="commentUserNickName"
            @click="goToPersonal(item.user.userId)"
            >{{ item.user.nickname }}:&nbsp;</span
          >
          <span class="content">{{ item.content }}</span>
        </div>
        <div class="replied">
          <div
            class="repliedItem"
            v-for="(item1, index1) in item.beReplied"
            :key="index1"
          >
            <span class="repliedUser" @click="goToPersonal(item.user.userId)"
              >@{{ item1.user.nickname }}:&nbsp;</span
            >
            <span class="repliedContent">{{ item1.content }}</span>
          </div>
        </div>
        <div class="commentBottom">
          <div class="commentCreatedTime">
            {{ item.time | showDate }}
          </div>
          <div class="commentButtons">
            <div
              @click="likeCurrentComment(item.liked, item.commentId)"
              :class="item.liked ? 'likeCurrentComment' : ''"
            >
              <i class="iconfont icon-good"></i> {{ item.likedCount }}
            </div>
            <div><i class="iconfont icon-zhuanfa"></i></div>
            <div>
              <i
                class="iconfont icon-pinglun"
                @click="floorComment(item.commentId, item.user.nickname)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from "plugins/utils";

export default {
  name: "Comment",
  props: {
    // 评论数据
    comments: {
      type: Array,
      default() {
        return [];
      },
    },
    // 评论的类型
    commentType: {
      type: String,
      default() {
        return "";
      },
    },
    // 评论对象的id
    commentId: {
      type: String,
      default() {
        return "";
      },
    },
    // 歌曲评论需要歌曲名称
    musicTitle: {
      type: String,
      default() {
        return "";
      },
    },
    // 是否是热门评论
    isHotComment: {
      type: Boolean,
      default() {
        return true;
      },
    },
  },
  data() {
    return {
      commentInput: "",
      // 是否显示评论dialog
      isCommentDialogShow: false,
      // 评论模式   true是常规评论   false是楼层评论
      commentMode: true,
      // 楼层回复前面几个字的长度
      floorCommentInputLength: 0,
      // 用于暂存楼层评论id
      floorCommentId: "",
    };
  },
  methods: {
    // 点击提交评论的回调
    async submitComment() {
      // 判断是否登录
      if (!this.$store.state.isLogin) {
        this.$message.warning("只有登陆后才能评论哦!");
        return;
      }

      // 先判断评论内容是否为空
      if (this.commentInput == "") {
        this.$message.warning("评论内容不能为空哦!");
        return;
      }

      // 判断评论的类型
      let type;
      switch (this.commentType) {
        case "album":
          type = 3;
          break;
        case "musicList":
          type = 2;
          break;
        case "music":
          type = 0;
          break;
        case "mv":
          type = 1;
          break;
        case "video":
          type = 5;
          break;
      }
      let res = await this.$request("/comment", {
        t: 1,
        id: this.commentId,
        type,
        content: this.commentInput,
      }).catch((err) => {
        // console.log(err.response.data.msg);
        this.$message.error(err.response.data.msg);
      });

      if (!res) {
        return;
      }

      // console.log(res);
      if (res.data.code == 200) {
        // 清空文本框
        // 如果是单曲卡片评论，还需要关闭卡片
        if (this.commentType == "music") {
          this.isCommentDialogShow = false;
        }
        this.commentInput = "";
        this.$emit("getComment");
      } else {
        this.$message.error("评论失败,请稍后重试!");
      }
    },

    // 关闭评论dialog的回调
    closeCommentDialog() {
      this.isCommentDialogShow = false;
      this.commentInput = "";
      this.floorCommentId = "";
      this.commentMode = true;
      this.floorCommentInputLength = 0;
    },
    // 点击喜欢该评论的回调
    async likeCurrentComment(flag, cid) {
      console.log(flag, cid);
      // 判断是否登录
      if (!this.$store.state.isLogin) {
        this.$message.warning("只有登陆后才能点赞哦!");
        return;
      }

      // 获取时间戳
      var timestamp = Date.parse(new Date());

      // 判断评论的类型
      let type;
      switch (this.commentType) {
        case "album":
          type = 3;
          break;
        case "musicList":
          type = 2;
          break;
        case "music":
          type = 0;
          break;
        case "mv":
          type = 1;
          break;
        case "video":
          type = 5;
          break;
      }

      let res = await this.$request("/comment/like", {
        id: this.commentId,
        cid,
        t: flag ? 0 : 1,
        type,
        timestamp,
      });
      console.log(res);
      if (res.data.code == 200) {
        this.$emit("getComment");
      } else {
        this.$message.error("点赞失败,请稍后重试!");
      }
    },

    // 点击楼层评论的回调
    // commentId是评论id  nickName是评论作者
    floorComment(commentId, nickName) {
      console.log(commentId, nickName);
      // isHotComment为false 说明没有文本框
      if (this.isHotComment == false) {
        // 将其转给hotComment处理
        this.$emit("transToHotComment", { commentId, nickName });
      }
      if (this.commentType != "music") {
        // 让父元素滚动到评论框
        this.$emit("scrollToComment");
        // 让评论框获得焦点
        let input = document.querySelector(".commentArea");
        // 阻止focus定位
        input.children[0].focus({ preventScroll: true });
      } else {
        this.openDialog();
      }
      this.commentInput = "回复" + nickName + "：";
      this.floorCommentInputLength = this.commentInput.length;
      // 将评论模式改为楼层评论
      this.commentMode = false;
      this.floorCommentId = commentId;
    },

    // 点击提交楼层评论的回调
    async submitFloorComment() {
      console.log("提交楼层评论");

      // 判断是否登录
      if (!this.$store.state.isLogin) {
        this.$message.warning("只有登陆后才能评论哦!");
        return;
      }

      if (this.commentInput.length == this.floorCommentInputLength) {
        this.$message.error("评论内容不能为空哦!");
        return;
      }

      // 判断评论的类型
      let type;
      switch (this.commentType) {
        case "album":
          type = 3;
          break;
        case "musicList":
          type = 2;
          break;
        case "music":
          type = 0;
          break;
        case "mv":
          type = 1;
          break;
        case "video":
          type = 5;
          break;
      }
      let res = await this.$request("/comment", {
        t: 2,
        id: this.commentId,
        type,
        content: this.commentInput,
        commentId: this.floorCommentId,
      }).catch((err) => {
        // console.log(err.response.data.msg);
        this.$message.error(err.response.data.msg);
      });

      if (!res) {
        return;
      }
      // console.log(res);
      if (res.data.code == 200) {
        // 清空文本框
        // 如果是单曲卡片评论，还需要关闭卡片
        if (this.commentType == "music") {
          this.isCommentDialogShow = false;
        }
        this.commentInput = "";
        this.commentMode = true;
        this.floorCommentInputLength = 0;
        this.floorCommentId = "";
        this.isCommentDialogShow = false;
        this.$emit("getComment");
      } else {
        this.$message.error("评论失败,请稍后重试!");
      }
    },

    // 监听键盘事件
    inputComment() {
      // 如果是楼层回复
      if (this.commentMode == false) {
        if (this.commentInput.length < this.floorCommentInputLength) {
          // 当长度小于当前楼层评论前面默认的字时
          this.commentMode = true;
          console.log("修改mode");
        }
      }
    },

    // 打开musicCommentDialog
    openDialog() {
      this.isCommentDialogShow = !this.isCommentDialogShow;
      // dialog在第一次出现前是不渲染的，所以这里用nextTick
      this.$nextTick(() => {
        // 让评论框获得焦点
        let input = document.querySelector(".musicCommentArea");
        input.children[0].focus();
        // console.log([input]);
      });
    },

    // 点击用户名的回调
    goToPersonal(userId) {
      this.$router.push({
        name: "personal",
        params: { uid: userId },
      });
      if (this.commentType == "music") {
        // this.$emit("closeMuiscDetailCard");
        this.$store.commit("changeMusicDetailCardState", false);
      }
    },
  },
  filters: {
    showDate(value) {
      // 1、先将时间戳转成Date对象
      const date = new Date(value);

      // 2、将date进行格式化
      return formatDate(date, "yyyy-MM-dd");
    },
  },
  watch: {
    // 评论数据发生变化时 重置所有发表评论的数据
    comments(current) {
      this.commentInpt = "";
      this.isCommentDialogShow = false;
      this.commentMode = true;
      this.floorCommentInputLength = 0;
      this.floorCommentId = "";
    },
  },
  created() {},
};
</script>

<style scoped>
.hotComments {
  margin-bottom: 20px;
  width: 100%;
}

.commentHeader {
  font-size: 14px;
  color: #cccccc;
  font-weight: 600;
  padding: 10px 0;
}
.commentItem {
  display: flex;
  margin: 5px 0;
  padding: 10px 0 20px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
}

.commentCreatorAvatar {
  width: 35px;
  height: 35px;
  margin: 0px 10px 0 0;
}

.commentCreatorAvatar img {
  width: 100%;
  border-radius: 50%;
  cursor: pointer;
}

.commentMain {
  width: calc(100% - 50px);
}

.commentUserNickName {
  color: #5a8ab9;
  cursor: pointer;
}

.commentBottom {
  margin-top: 2px;
  color: rgb(172, 172, 172);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.commentButtons {
  display: flex;
  align-items: center;
}
.commentButtons div {
  margin-top: -3px;
  padding: 0 8px;
  transform: scale(0.85);
}

.commentButtons div:nth-child(1) {
  font-size: 14px;
}

.replied {
  background-color: #202023;
  margin: 7px 0;
  border-radius: 5px;
  color: #cccccc;
}

.repliedItem {
  padding: 7px 10px;
  line-height: 20px;
}

.repliedUser {
  color: #5a8ab9;
  cursor: pointer;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
}

.commentContent > span {
  line-height: 20px;
}
.content{
  color: #cccccc;
}
.el-textarea /deep/ .el-textarea__inner {
  height: 65px !important;
  font-size: 12px;
  resize: none;
}

.el-textarea /deep/ .el-textarea__inner:focus {
  border-color: #aaa;
}

.el-textarea /deep/ .el-input__count {
  transform: scale(0.9);
}

.submitCommentButton {
  width: 100%;
  text-align: right;
  margin: 10px 0;
}

.el-button:hover {
  background-color: #f2f2f2;
}

.el-button {
  transform: scale(0.9) translateX(5%);
  background: #2b2c31;
  color: #cccccc;
  border: 1px solid #2b2c31;
}

.submitComment:focus {
  background-color: #fff;
}

.commentCardSwitch {
  position: fixed;
  left: 50%;
  top: calc(80vh - 105px);
  transform: translateX(-50%) scale(0.9);
  border: none;
  background-color: #f1f1f1;
  line-height: 15px;
  padding: 10px 10px 10px 30px;
}

.commentCardSwitch:hover {
  background-color: #e1e1e1;
}

.commentCardSwitch i {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
}

.musicTitle {
  width: 100%;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 10px;
}

.musicCommentArea /deep/ .el-textarea__inner {
  height: 110px !important;
}
::v-deep .el-textarea[data-v-9b7ef5a2] .el-textarea__inner{
  background: #2b2c31 !important;
  border: 1px solid #2b2c31;
}
.musicSubmitComment {
  padding: 8px 20px;
  font-size: 13px;
  background-color: #ec4141;
  color: white;
  border: none;
}

.musicSubmitComment:hover {
  background-color: #eb2e2e;
  color: white;
}

.musicSubmitComment:focus {
  color: white;
  background-color: #ec4141;
}

.commentDialog /deep/ .el-dialog__body {
  padding-bottom: 5px !important;
}

.likeCurrentComment,
.likeCurrentComment i {
  color: #ec4141 !important;
}
::v-deep .el-textarea[data-v-9b7ef5a2] .el-input__count{
  background: #2b2c31;
  color: #cccccc;
}
</style>