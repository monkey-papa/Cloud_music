<template>
  <div>
    <div class="bottomControls">
      <lyrics-scrolls :lyric="lyric" v-if="isShow"></lyrics-scrolls>
    </div>
    <!-- 底部播放栏以及播放栏抽屉 -->
    <div class="bottomControl">
      <audio :src="musicUrl" ref="audioPlayer" autoplay @play="changeState(true)" @pause="changeState(false)" @ended="changeMusic('next')" @timeupdate="timeupdate"></audio>
      <!-- 左边 -->
      <div class="left">
        <div
          class="avatar"
          @click="
            $store.commit('changeMusicDetailCardState')
            State()
          "
        >
          <img :src="musicDetail.al.picUrl" alt="" v-if="musicDetail.al" :draggable="false" />
          <img src="~assets/img/test.jpg" alt="" v-else :draggable="false" />
        </div>
        <div class="musicInfo">
          <div class="musicName" v-if="musicDetail && musicDetail.name">
            {{ musicDetail.name }}
          </div>
          <div class="singer" v-if="musicDetail && musicDetail.name" @click="goToSingerDetail">
            {{ musicDetail.ar[0].name }}
          </div>
        </div>
        <div class="downloadContainer" v-if="musicDetail.name">
          <i class="iconfont icon-download" @click="downloadCurrentMusic"></i>
        </div>
      </div>
      <!-- 中间 -->
      <div class="center">
        <div class="buttons">
          <span @click="playType = playType == 'order' ? 'random' : 'order'"><i class="iconfont icon-xunhuan" title="顺序播放" v-if="playType == 'order'"></i><i class="iconfont icon-suiji1" title="随机播放" v-else></i></span>
          <span @click="musicList.length != 0 ? changeMusic('pre') : ''"><i class="iconfont icon-shangyishou" title="上一首"></i></span>
          <span @click="musicList.length != 0 ? changePlayState() : ''">
            <i class="iconfont icon-icon_play" v-if="!this.$store.state.isPlay"></i>
            <i class="iconfont icon-zantingtingzhi" v-else></i>
          </span>
          <span @click="musicList.length != 0 ? changeMusic('next') : ''"><i class="iconfont icon-xiayishou" title="下一首"></i></span>
          <span><i class="iconfont icon-xihuan" :class="isUserLikeCurrentMusic ? 'like' : ''" @click="musicList.length != 0 ? likeIt() : ''"></i></span>
        </div>
        <!-- 进度条 -->
        <div class="progressBar">
          <span class="currentTime">{{ currentTime | handleMusicTime }}</span>
          <!-- :value 是单向的  要实现双向要v-model -->
          <el-slider class="progressSlider" v-model="timeProgress" :show-tooltip="false" @change="changeProgress" :disabled="musicList.length == 0"></el-slider>
          <span class="totalTime">{{ duration }}</span>
        </div>
      </div>
      <!-- 右边 -->
      <div class="right">
        <div class="volumeControl">
          <!-- 歌词图标 -->
          <i class="iconfont icon-geciweidianji" @click="Show" :class="{'active':isShow}"></i>
          <!-- 音量图标 -->
          <i :class="{ 'iconfont icon-24gl-volumeHigh': isMuted == false, 'iconfont icon-24gl-volumeCross': isMuted == true ,'active':isMuted}" @click="changeMutedState"></i>
          <!-- 音量条 -->
          <el-slider class="volumeSlider" v-model="volume" @input="changeVolume" :show-tooltip="false"></el-slider>
        </div>
        <div class="playList" @click="openDrawer">
          <i class="iconfont icon-bofangliebiao" :class="{'active':isDrawer}" title="播放列表"></i>
        </div>
        <!-- 备案信息 -->
        <el-tooltip class="item" effect="dark" placement="left" :enterable="false">
          <div v-html="recondInfo" slot="content"></div>
          <el-link type="info" href="https://beian.miit.gov.cn/" target="_blank" class="recondInfo">粤ICP备2022120812号</el-link>
        </el-tooltip>
      </div>
      <!-- 抽屉 -->
      <el-drawer :visible.sync="drawer" :with-header="false" width="300">
        <div class="drawerHeader">总{{ musicList.length }}首</div>
        <el-table :data="musicList" :cell-style="{background:'#202023'}" style="width: 100%" :show-header="false" @row-dblclick="clickRow" highlight-current-row lazy>
          <el-table-column prop="name" width="150px"> </el-table-column>
          <el-table-column prop="ar[0].name" width="80px"> </el-table-column>
          <el-table-column prop="dt" width="70px"> </el-table-column>
        </el-table>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import { handleMusicTime, returnSecond } from 'plugins/utils'
import LyricsScrolls from '@/components/lyricsScroll/LyricsScrolls'
let lastSecond = 0
// 总时长的秒数
let durationNum = 0
// 保存当前音量
let volumeSave = 0
// 当前音乐类型，用于下载
let musicType = ''

export default {
  name: 'BottomControl',
  data() {
    return {
      //歌词
      lyric: [],
      musicDetail: {},
      musicUrl: '',
      musicList: [],
      currentMusicIndex: 0,
      drawer: false,
      // 音乐总时长
      duration: '00:00',
      // 当前播放时间位置
      currentTime: 0,
      // 进度条的位置
      timeProgress: 0,
      // 基础音量
      volume: 3,
      // 是否静音
      isMuted: false,
      // 抽屉是否被打开过（如果没打开过，里面的数据是不会渲染的）
      hasDrawerOpend: false,
      // 用户的喜欢音乐列表
      likeMusicList: [],
      // 用户是否喜欢当前音乐
      isUserLikeCurrentMusic: false,
      recondInfo: `<div style='text-align:center;font-size:12px;'>
粤ICP备20221215号<br>个人邮箱:1816298537@qq.com<br>本站为仿网易云音乐展示项目,仅供学习使用,侵权必删!</div>`,
      // 播放模式（顺序播放，随机播放）
      // order random
      playType: 'order',
      //控制歌词是否显示
      isShow: false,
      //控制抽屉动态样式
      isDrawer:false
    }
  },
  methods: {
    // 请求
    //请求并处理歌词数据
    async getLyric(id) {
      let res = await this.$request('/lyric', { id })
      let lyrics = res.data.lrc.lyric
      // 对获取到的歌词进行处理
      let arr = lyrics.split('\n')
      let array = []
      // let obj = {};
      let time = ''
      let value = ''
      let result = []

      //去除空行
      arr.forEach(item => {
        if (item != '') {
          array.push(item)
        }
      })
      arr = array
      arr.forEach(item => {
        time = item.split(']')[0]
        value = item.split(']')[1]
        //去掉时间里的中括号得到xx:xx.xx
        var t = time.slice(1).split(':')
        //将结果压入最终数组
        result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value])
      })
      this.lyric = result
    },
    // 请求
    // 请求歌曲的url
    async getMusicDetail(id) {
      this.$store.commit('updateMusicLoadState', true)
      let result = await this.$request('/song/url', { id })
      // console.log(musicDetail);
      // console.log(result);
      // 获取不到url
      if (result.data.data[0].url == null) {
        this.$message.error('该歌曲暂无版权，将为您播放下一首歌曲')
        this.changeMusic('next')
        return
      }
      this.musicUrl = result.data.data[0].url
      musicType = result.data.data[0].type.toLowerCase()
      this.$store.commit('updateMusicLoadState', false)
    },
    // 喜欢该音乐
    // like参数:是否喜欢该音乐
    async likeMusic(id, like) {
      let res = await this.$request('/like', { id, like })
      if (res.data.code == 200) {
        this.$message.success("操作成功");
      } else {
        this.$message.error("操作失败");
      }
    },
    // 获取喜欢音乐列表
    async getLikeMusicList() {
      // 获取时间戳
      var timestamp = Date.parse(new Date())
      // 因为喜欢音乐列表实时性较高，为了避免接口缓存，在请求后面加上一个时间戳
      let res = await this.$request('/likelist', {
        uid: window.localStorage.getItem('userId'),
        timestamp
      })
      this.likeMusicList = res.data.ids
      // 将喜欢列表提交到vuex 供歌单中显示喜欢使用 （因为性能问题暂时没做）
      this.$store.commit('updataLikeMusicList', this.likeMusicList)
    },

    // 点击播放键的回调
    changePlayState() {
      !this.$store.state.isPlay ? this.playMusic() : this.pauseMusic()
    },
    // 播放音乐的函数
    playMusic() {
      this.$refs.audioPlayer.play()
    },
    // 暂停音乐的函数
    pauseMusic() {
      this.$refs.audioPlayer.pause()
    },
    // audio开始或暂停播放的回调  在vuex中改变状态
    changeState(state) {
      this.$store.commit('changePlayState', state)
    },
    // 根据id找到 musicList中对应的musicDetail
    getMusicDetailFromMusicList() {
      // console.log(this.musicList);
      // this.musicList.forEach((item, index) => {
      //   // console.log(index);
      //   if (item.id == this.$store.state.musicId) {
      //     // 记录当前音乐的index
      //     this.currentMusicIndex = index;
      //     // 将索引传至vuex
      //     this.$store.commit("updateCurrentIndex", index);
      //     this.musicDetail = item;
      //     // 直接从audio标签中的duration属性拿时长会有请求时差问题，所以直接在musicInfo中拿
      //     this.duration = this.musicList[index].dt;
      //   }
      // });

      let index = this.musicList.findIndex(item => item.id == this.$store.state.musicId)
      // console.log(index)
      if (index != -1) {
        // 记录当前音乐的index
        this.currentMusicIndex = index
        // 将索引传至vuex
        this.$store.commit('updateCurrentIndex', index)
        this.musicDetail = this.musicList[index]
        // 直接从audio标签中的duration属性拿时长会有请求时差问题，所以直接在musicInfo中拿
        this.duration = this.musicList[index].dt
      }
    },
    // 切歌函数
    changeMusic(type, id) {
      if (type == 'click') {
        // 点击抽屉row进行切歌
        this.$store.commit('updateMusicId', id)
      } else if (type == 'pre') {
        let currentMusicIndex = this.currentMusicIndex
        let preIndex
        if (this.playType == 'order') {
          preIndex = currentMusicIndex - 1 < 0 ? this.musicList.length - 1 : currentMusicIndex - 1
        } else if (this.playType == 'random') {
          if (this.musicList.length == 1) {
            preIndex = currentMusicIndex
          } else {
            // Math.floor(Math.random()*10); 可均衡获取0到9的随机整数。
            preIndex = currentMusicIndex
            while (preIndex == currentMusicIndex) {
              preIndex = Math.floor(Math.random() * this.musicList.length)
            }
          }
        }
        console.log(this.musicList[preIndex].id)
        this.$store.commit('updateMusicId', this.musicList[preIndex].id)
      } else if (type == 'next') {
        let currentMusicIndex = this.currentMusicIndex
        let nextIndex
        if (this.playType == 'order') {
          nextIndex = currentMusicIndex + 1 == this.musicList.length ? 0 : currentMusicIndex + 1
        } else if (this.playType == 'random') {
          if (this.musicList.length == 1) {
            nextIndex = currentMusicIndex
          } else {
            // Math.floor(Math.random()*10); 可均衡获取0到9的随机整数。
            nextIndex = currentMusicIndex
            while (nextIndex == currentMusicIndex) {
              nextIndex = Math.floor(Math.random() * this.musicList.length)
            }
          }
        }
        // console.log(this.musicList[nextIndex].id);
        this.$store.commit('updateMusicId', this.musicList[nextIndex].id)
      }
    },
    // 双击抽屉列表中的row的回调
    clickRow(row) {
      // console.log(row.id);
      this.changeMusic('click', row.id)
    },
    // 当前播放时间位置
    timeupdate() {
      // console.log(e);
      // console.log(this.$refs.audioPlayer.currentTime);
      // 节流
      let time = this.$refs.audioPlayer.currentTime
      // 将当前播放时间保存到vuex  如果保存到vuex这步节流,会导致歌词不精准,误差最大有1s
      this.$store.commit('updateCurrentTime', time)

      time = Math.floor(time)
      if (time !== lastSecond) {
        // console.log(time);
        lastSecond = time
        this.currentTime = time
        // 计算进度条的位置
        this.timeProgress = Math.floor((time / durationNum) * 100)
        // console.log(this.timeProgress);
      }
    },
    // 拖动进度条的回调
    changeProgress(e) {
      // console.log(e);
      // 修改当前播放时间
      this.currentTime = Math.floor((e / 100) * durationNum)
      // 改变audio的实际当前播放时间
      this.$refs.audioPlayer.currentTime = this.currentTime
    },
    // 拖动音量条的回调
    changeVolume(e) {
      // 改变audio的音量
      // input事件 实时触发
      this.$refs.audioPlayer.volume = e / 100
      if (this.isMuted && e > 0) {
        this.isMuted = false
      } else if (e == 0 && this.isMuted == false) {
        this.isMuted = true
      }
    },
    // 点击小喇叭的回调 （切换静音状态）
    changeMutedState() {
      if (this.isMuted) {
        this.volume = volumeSave
      } else {
        volumeSave = this.volume
        this.volume = 0
      }
      console.log(volumeSave, this.isMuted)
      this.isMuted = !this.isMuted
    },
    // 操作drawerList中DOM的函数
    handleDrawerListDOM(currentIndex, lastIndex) {
      // 目前没什么好思路 直接操作原生DOM
      this.$nextTick(() => {
        let tableRows = document.querySelector('.bottomControl').querySelectorAll('.el-table__row')
        // // 直接修改dom样式的颜色无效  可能是因为第三方组件 style scoped的原因
        // // 通过引入全局样式解决
        if (tableRows[currentIndex]) {
          tableRows[currentIndex].children[0].querySelector('.cell').classList.add('currentRow')
          tableRows[currentIndex].children[1].querySelector('.cell').classList.add('currentRow')
        }
        if ((lastIndex && lastIndex != -1 && tableRows[lastIndex]) || lastIndex == 0) {
          // 将上一首的类名删掉
          tableRows[lastIndex].children[0].querySelector('.cell').classList.remove('currentRow')
          tableRows[lastIndex].children[1].querySelector('.cell').classList.remove('currentRow')
        }
      })
    },
    // 点击打开抽屉的回调
    openDrawer() {
      // 关闭也是这个回调，所以直接取反
      this.drawer = !this.drawer
      this.hasDrawerOpend = true
      this.handleDrawerListDOM(this.currentMusicIndex)
      //样式调整
      this.isDrawer = !this.isDrawer
    },

    // 判断用户是否喜欢该音乐
    getIsUserLikeCurrentMusic() {
      this.isUserLikeCurrentMusic = this.likeMusicList.find(item => item == this.$store.state.musicId)
    },
    // 用户点击喜欢该音乐的回调
    async likeIt() {
      // console.log(this.likeMusicList.length)
      //如果都展示不了likeMusicList，也就等同于没有登录了
      if (this.likeMusicList.length < 0) {
        this.$message.error('请先登录!')
        return
      }
      this.isUserLikeCurrentMusic = !this.isUserLikeCurrentMusic
      await this.likeMusic(this.$store.state.musicId, this.isUserLikeCurrentMusic)
      await this.getLikeMusicList()
    },

    // 点击下载按钮的回调
    downloadCurrentMusic() {
      // console.log("download");
      // console.log(this.musicDetail, this.musicUrl)
      // 匹配资源的域名
      let url = this.musicUrl.match(/\http.*?\.net/)
      // 匹配域名名称，并匹配对应的代理
      let serve = url[0].match(/http:\/(\S*).music/)[1]
      if (serve != '/m7' && serve != '/m701' && serve != '/m8' && serve != '/m801') {
        // 没有对应的代理
        this.$message.error('匹配不到对应的代理,下载失败!')
        return
      }
      // 截取后面的参数
      let params = this.musicUrl.slice(url[0].length)

      let downloadMusicInfo = {
        url: serve + params,
        name: this.musicDetail.name + ' - ' + this.musicDetail.ar[0].name + '.' + musicType
      }

      console.log(downloadMusicInfo)
      this.$store.commit('updateDownloadMusicInfo', downloadMusicInfo)
    },

    // 点击歌手名跳转至歌手页面的回调
    goToSingerDetail() {
      if (this.$route.path == `/singerDetail/${this.musicDetail.ar[0].id}`)
        this.$router.push({
          name: 'singerDetail',
          params: { id: this.musicDetail.ar[0].id }
        })
      if (this.$store.state.isMusicDetailCardShow == true) {
        this.$store.state.commit('changeMusicDetailCardState', false)
      }
    },
    //控制歌词显示
    Show() {
      this.isShow = !this.isShow
    },
    //控制歌词显示
    State(){
      this.isShow = false
    }
  },

  watch: {
    // 监听vuex中musicId的变化
    '$store.state.musicId'(id) {
      // console.log('vuex中的id发生了变化')
      // 先暂停当前播放的音乐
      this.pauseMusic()
      this.musicList = this.$store.state.musicList
      this.getMusicDetailFromMusicList()
      this.getMusicDetail(id)
      this.getLyric(id)
      durationNum = returnSecond(this.duration)
      // 判断用户是否喜欢当前音乐
      this.getIsUserLikeCurrentMusic()
      // console.log(this.$refs.audioPlayer);
    },
    // 监听currentIndex的变化
    '$store.state.currentIndex'(currentIndex, lastIndex) {
      if (this.hasDrawerOpend) {
        this.handleDrawerListDOM(currentIndex, lastIndex)
      }
    },
    // 监听播放状态
    '$store.state.isPlay'(isPlay) {
      if (isPlay) {
        this.playMusic()
      } else {
        this.pauseMusic()
      }
    },
    '$store.state.isLogin'(current) {
      if (current) {
        this.getLikeMusicList()
      } else {
        // 清空喜欢列表
        this.likeMusicList = []
      }
    }
  },
  filters: {
    handleMusicTime
  },
  components: { LyricsScrolls }
}
</script>

<style scoped>
.bottomControl {
  border-top: 1px solid #212124;
  width: 100%;
  height: 55px;
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  z-index: 10000;
  background-color: #212124;
}
.bottomControls {
  height: 120px;
  position: fixed;
  bottom: 0;
  left: 30%;
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  z-index: 10000;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  overflow: hidden;
  margin-right: 10px;
  cursor: pointer;
}

.avatar img {
  width: 100%;
}

.left {
  display: flex;
  align-items: center;
  width: 123px;
}

.musicInfo {
  color: #ffffff;
  font-size: 12px;
  width: 70px;
}

.musicName {
  margin-bottom: 4px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.singer {
  transform: scale(0.9);
  margin-left: -3px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.center {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.buttons {
  display: flex;
  align-items: center;
  height: 13px;
}

.buttons i {
  font-size: 20px;
  color: #ffffff;
}

.downloadContainer i{
  color: #ffffff;
}
.buttons span:nth-child(3) i {
  font-size: 25px;
}

.playList i{
  color: #ffffff;
}
.playList .active{
  color: #ec4141;
}
.center .icon-xunhuan {
  font-size: 17px;
}
.center .icon-xihuan {
  font-size: 15px;
}

.right {
  display: flex;
  align-items: center;
  position: relative;
}

.volumeControl {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.volumeControl i{
  color: #ffffff;
}
.volumeControl .active{
  color: #ec4141;
}
.icon-24gl-volumeHigh {
  font-size: 18px;
  margin-right: 7px;
}

.icon-24gl-volumeCross {
  font-size: 18px;
  margin-right: 7px;
}

.icon-geciweidianji {
  font-size: 18px;
  margin-right: 15px;
}
.volumeControl .active{
  color: #ec4141;
}
.volumeSlider {
  width: 55px;
}

.icon-bofangliebiao {
  font-size: 18px;
  margin-right: 10px;
}

.progressSlider {
  width: 300px;
}

.buttons span {
  display: inline-block;
  width: 50px;
  box-sizing: border-box;
  text-align: center;
}

.icon-zantingtingzhi {
  font-size: 35px !important;
}

.drawerHeader {
  font-size: 12px;
  color: #ff0000;
  padding: 15px 0;
  background: #16181c;
}

.progressBar {
  display: flex;
  align-items: center;
}

.currentTime,
.totalTime {
  font-size: 12px;
  transform: scale(0.85);
  color: #aaa;
  margin: 0 5px;
  width: 30px;
  text-align: center;
}

.progressBar {
  height: 10px;
  margin-top: 12px;
  overflow: hidden;
}

.like {
  color: #ec4141 !important;
}

.downloadContainer {
  height: 100%;
  position: relative;
}

.downloadContainer i {
  position: absolute;
  bottom: 5px;
}

.recondInfo {
  position: absolute;
  font-size: 12px;
  transform: scale(0.8);
  width: 140px;
  right: -5px;
  bottom: -5px;
  color: #ffffff;
}

.center .icon-suiji1 {
  font-size: 15px;
}
</style>
