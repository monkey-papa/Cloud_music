<template>
  <div class="recommendContainer">
    <!-- 个性推荐 -->
    <!-- 轮播图 -->
    <div class="recommend">
      <div class="carousel">
        <el-carousel :interval="3000" type="card" height="180px">
          <el-carousel-item v-for="(item, index) in bannerData" :key="index">
            <img :src="item.imageUrl" alt=""/>
          </el-carousel-item>
        </el-carousel>
      </div>
      <!-- 个性推荐 -->
      <div class="recommendMusicList">
        <h3>推荐歌单</h3>
        <list-card :listCardData="musicList" @clickListCardItem="clickListCardItem"></list-card>
        <!-- 独家放送MV -->
        <div class="private" v-if="pri != null">
          <h3 class="top">{{ pri.name }}MV</h3>
          <div class="content">
            <div class="item" v-for="(item, index) in pri.result" :key="index" @click="goToVideoDetail(item.id, index, item.type)">
              <div class="loco">
                <i class="iconfont icon-shipin"></i>
              </div>
              <img :src="item.picUrl" alt />
              <div class="bottom">
                {{ item.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-if="mobile()" title="提示" :visible.sync="dialogVisible" width="70%" :before-close="handleClose">
      <span>此网页适配于电脑端，用电脑访问效果最佳喔(*^▽^*)</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ListCard from 'components/listCard/ListCard.vue'
export default {
  components: { ListCard },
  name: 'Recommend',
  data() {
    return {
      // 轮播图数据
      bannerData: [],
      // recommend页面显示的musicList
      musicList: [],
      //独家放送数据
      pri: [],
      //最新音乐数据
      musicList:[],
      dialogVisible: true
    }
  },
  methods: {
    //适配判断
    mobile() {
      let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
      return flag && flag.length && flag.length > 0
    },
    //点击独家放送回调
    goToVideoDetail(id) {
      // console.log(id)
      this.$router.push({
        name: 'videoDetail',
        params: { id, type: 'mv' }
      })
    },
    //获取独家放送数据
    async getPrivateContent() {
      let result = await this.$request('/personalized/privatecontent')
      // console.log(result)
      this.pri = result.data
    },
    // 请求轮播图数据
    async getBannerData() {
      let result = await this.$request('/banner')
      // console.log(result);
      this.bannerData = result.data.banners
    },

    // 请求推荐歌单数据的前20个
    getMusicList() {
      this.$request('/personalized', { limit: 20 }).then(res => {
        // console.log(res);
        this.musicList = res.data.result
        // console.log(this.musicList)
      })
    },
    // 点击歌单封面的回调
    clickListCardItem(id) {
      // console.log(id);
      this.$router.push({ name: 'musicListDetail', params: { id } })
    },
    // 双击table的row的回调
    async clickRow(row) {
      // console.log(row);
      // 将musicId提交到vuex中 供bottomControl查询歌曲url和其它操作
      this.$store.commit("updateMusicId", row.id);
      // 如果歌单发生变化,则提交歌单到vuex
      if (this.musicListDetail.id != this.$store.state.musicListId) {
        // 将歌单传到vuex
        this.$store.commit("updateMusicList", {
          musicList: this.musicListDetail.tracks,
          musicListId: this.musicListDetail.id,
        });
      }
    },
  },
  created() {
    if (this.mobile()) {
      this.dialogVisible == !this.dialogVisible
      console.log(this.dialogVisible)
    }
    this.getBannerData()
    this.getMusicList()
    this.getPrivateContent()
  }
}
</script>

<style scoped>
.recommendContainer {
  display: flex;
  justify-content: center;
  background-color: #16181c;
}

.recommend {
  max-width: 1000px;
}

.carousel {
  width: 100%;
}

.el-carousel {
  margin: auto;
  width: 950px;
}

.el-carousel__item {
  border-radius: 10px;
}

.el-carousel__item img {
  height: 100%;
}

.recommendMusicList {
  margin: 20px 10px;
}

.recommendMusicList h3 {
  color: #cccccc;
}
/* 独家放送MV样式 */
.private {
  width: 100%;
  padding: 20px 0;
}
h4 {
  padding-left: 10px;
  color: #cccccc;
}
.content {
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.item {
  position: relative;
  width: calc(33% - 20px);
  margin: 0px 10px;
  overflow: hidden;
  border-radius: 10px;
}
.item img {
  width: 100%;
}
.bottom {
  font-size: 13px;
  color: #cccccc;
}
.loco {
  position: absolute;
  left: 5px;
  top: 5px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}
.loco img {
  width: 20px;
  border: 50%;
}
/* 小图标的白色 */
.iconfont {
  color: #ffffff;
}
::v-deep .el-dialog{
  background: #16181c;
}
::v-deep .el-dialog__title{
  color: #ec4141;
}
::v-deep .el-dialog__body{
  color: #ec4141;
}
::v-deep .el-button{
  background: #202023;
  color: #ec4141;
  border: none;
}
</style>
