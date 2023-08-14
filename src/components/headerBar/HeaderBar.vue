<template>
  <!-- 顶部 -->
  <div class="headerBar">
    <div class="left">
      <div class="r">
        <img class="logo" src="~assets/img/logo.png" alt="" />
      </div>
    </div>
    <div class="center">
      <div class="buttons">
        <i class="iconfont icon-arrow-left-bold back" @click="$router.go(-1)"></i>
        <i class="iconfont icon-arrow-right-bold forward" @click="$router.go(1)"></i>
      </div>
      <div class="search">
        <el-popover placement="bottom" width="300" v-model="isSearchPopShow" popper-class="searchPop" trigger="focus">
          <el-input placeholder="请输入内容" prefix-icon="el-icon-search" size="mini" slot="reference" @input="inputSearch" @keyup.enter.native="onSubmit" v-model="searchInput"> </el-input>
          <!-- 搜索历史不想做了，做的话可以将搜索历史存到localStorage中 -->
          <!-- 热搜榜 -->
          <div class="hotSearch" v-if="!searchSuggestList.songs">
            <div class="hotSearchTitle">热搜榜</div>
            <div class="hotSearchItem" v-for="(item, index) in hotSearchList" :key="index" @click="clickHotSearchItem(item.searchWord)">
              <div class="hotSearchIndex" :class="index < 3 ? 'topThree' : ''">
                {{ index + 1 }}
              </div>
              <div class="hotSearchInfo">
                <div class="hotSearchWord" :class="index < 3 ? 'hotSearchWordTopThree' : ''">
                  {{ item.searchWord }}
                </div>
                <div class="hotSearchContent">{{ item.content }}</div>
              </div>
            </div>
          </div>
          <!-- 搜索建议 -->
          <div class="searchSuggest">
            <div class="hotSearchTitle" v-if="searchSuggestList.songs">搜索建议</div>
            <!-- 单曲 -->
            <div class="searchSuggestItem" v-if="searchSuggestList.songs && searchSuggestList.songs.length != 0">
              <div class="searchSuggestItemTitle"><i class="iconfont icon-yinle"></i> 单曲</div>
              <div class="suggestItemDetail" v-for="(item, index) in searchSuggestList.songs" :key="index" @click="clickSuggestSong(item.id)">
                {{ item.name + ' - ' + item.artists[0].name }}
              </div>
            </div>
            <!-- 歌手 -->
            <div class="searchSuggestItem" v-if="searchSuggestList.artists && searchSuggestList.artists.length != 0">
              <div class="searchSuggestItemTitle"><i class="iconfont icon-mic"></i> 歌手</div>
              <div class="suggestItemDetail" v-for="(item, index) in searchSuggestList.artists" :key="index" @click="clickSuggestSinger(item.id)">
                {{ item.name }}
              </div>
            </div>
            <!-- 专辑 -->
            <div class="searchSuggestItem" v-if="searchSuggestList.albums && searchSuggestList.albums.length != 0">
              <div class="searchSuggestItemTitle"><i class="iconfont icon-more"></i> 专辑</div>
              <div class="suggestItemDetail" v-for="(item, index) in searchSuggestList.albums" :key="index" @click="clickSuggestAlbum(item.id)">
                {{ item.name + ' - ' + item.artist.name }}
              </div>
            </div>
            <!-- 歌单 -->
            <div class="searchSuggestItem" v-if="searchSuggestList.playlists && searchSuggestList.playlists.length != 0">
              <div class="searchSuggestItemTitle"><i class="iconfont icon-gedan"></i> 歌单</div>
              <div class="suggestItemDetail" v-for="(item, index) in searchSuggestList.playlists" :key="index" @click="clickSuggestMusicList(item.id)">
                {{ item.name }}
              </div>
            </div>
          </div>
          <!-- <img src="~assets/img/searh.png" alt="" /> -->
        </el-popover>
      </div>
    </div>
    <div class="right">
      <div class="user">
        <div class="avatar">
          <!-- 登录框 -->
          <el-popover placement="bottom" width="330" trigger="click" v-if="!userInfo.avatarUrl">
            <login
              :isRegisteredShow.sync="isRegisteredShow"
              @getUserInfo="
                info => {
                  userInfo = info
                  isPopoverShow = false
                }
              "
            ></login>
            <img src="~assets/img/test.jpg" alt="" slot="reference" @click="isPopoverShow = !isPopoverShow" />
          </el-popover>
          <img :src="userInfo.avatarUrl" alt="" slot="reference" v-else @click="goToPersonal" />
        </div>
        <div class="userName" v-if="userInfo.nickname" @click="goToPersonal">
          {{ userInfo.nickname }}
        </div>
        <div class="userName" v-else>点击头像登录</div>
      </div>
    </div>

    <!-- 注册框组件 -->
    <registered :isDialogShow="isRegisteredShow" @closeRegistered="closeRegistered"></registered>
  </div>
</template>

<script>
import { handleMusicTime } from 'plugins/utils'
import Registered from 'components/registered/Registered.vue'
import Login from 'components/login/Login.vue'
// 节流定时器名称
let timer

export default {
  components: { Registered, Login },
  name: 'HeaderBar',
  data() {
    return {
      userInfo: {},
      isPopoverShow: false,
      // 是否显示searchPop
      isSearchPopShow: false,
      // 热搜列表数据
      hotSearchList: [],
      // 需要搜索的内容
      searchInput: '',
      // 搜索建议列表
      searchSuggestList: {},
      // 是否显示注册框
      isRegisteredShow: false
    }
  },
  methods: {
    //   请求
    // 手机前端验证正则表达式
    // let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/;

    // 获取热搜列表
    async getHotSearch() {
      let res = await this.$request('/search/hot/detail')
      // console.log(res);
      this.hotSearchList = res.data.data
    },
    // 获取搜索建议
    async getSearchSuggest(keywords) {
      let res = await this.$request('/search/suggest', { keywords })
      // console.log(res);
      this.searchSuggestList = res.data.result
    },
    // 根据id获取歌曲详情
    async getMusicInfo(ids) {
      let res = await this.$request('/song/detail', { ids })
      // console.log(res);
      // 处理时间
      res.data.songs[0].dt = handleMusicTime(res.data.songs[0].dt)
      return res.data.songs[0]
    },

    // 获取当前用户信息
    async getCurrentUserInfo() {
      var timestamp = Date.parse(new Date())
      let res = await this.$request('/user/account', {
        timestamp
      })
      // console.log(res);
      if (res.data.profile != null) {
        this.userInfo = res.data.profile
        // 更新登录状态
        this.$store.commit('updataLoginState', true)
        // 更新当前用户id
        // this.$store.commit("updateCurrentUserId", res.data.profile.userId);
        // 将请求到的用户id存入localstorage
        window.localStorage.setItem('userId', res.data.profile.userId)
      } else {
        // 未登录
        this.$store.commit('updataLoginState', false)
        // 如果localstorage存有userId就清除
        if (window.localStorage.getItem('userId')) {
          window.localStorage.removeItem('userId')
        }
      }
    },

    // 事件
    // 在搜索框中输入的回调
    inputSearch(e) {
      // console.log(e);
      clearTimeout(timer)
      if (e != '') {
        timer = setTimeout(() => {
          this.getSearchSuggest(e)
        }, 500)
      } else {
        // 清空searchSuggestList
        this.searchSuggestList = {}
        return
      }
    },
    // 在输入框按下回车的回调
    onSubmit(e) {
      if (e.keyCode == 13 && this.searchInput != '') {
        this.goSearch()
      }
    },
    // 跳转至搜索详情页面
    goSearch() {
      this.isSearchPopShow = false
      this.$router.push({ name: 'search', params: { id: this.searchInput } })
    },
    // 点击热搜榜item的回调
    clickHotSearchItem(searchWord) {
      this.searchInput = searchWord
      this.goSearch()
    },
    // 点击搜索建议中专辑的回调
    clickSuggestAlbum(id) {
      this.$router.push({ name: 'album', params: { id } })
      this.isSearchPopShow = false
    },
    // 点击搜索建议中歌手的回调
    clickSuggestSinger(id) {
      this.$router.push({ name: 'singerDetail', params: { id } })
      this.isSearchPopShow = false
    },
    // 点击搜索建议中歌单的回调
    clickSuggestMusicList(id) {
      this.$router.push({ name: 'musicListDetail', params: { id } })
      this.isSearchPopShow = false
    },
    // 点击搜索建议中单曲的回调
    async clickSuggestSong(id) {
      let row = await this.getMusicInfo(id)
      this.isSearchPopShow = false
      // 首先获取当前的歌单列表和歌曲索引
      let musicList = this.$store.state.musicList
      let currentIndex = this.$store.state.currentIndex
      // 先判断该歌曲是否已经在歌单中存在，避免重复点击导致歌单出现相同歌曲
      let isExist = musicList.find(item => item.id == row.id)
      if (isExist) {
        // 如果已经存在 则只提交歌曲id并return出去
        this.$store.commit('updateMusicId', row.id)
        return
      }
      this.$store.commit('changePlayState', false)
      // 将请求到的歌曲详情插入到歌单对应位置并提交至vuex
      musicList.splice(currentIndex + 1, 0, row)
      this.$store.commit('updateMusicId', row.id)
      this.$store.commit('updateMusicList', {
        musicList,
        musicListId: this.$store.state.musicListId
      })
    },

    // 关闭注册框
    closeRegistered() {
      this.isRegisteredShow = false
    },

    // 跳转至个人页面
    goToPersonal() {
      if (this.$route.path != `/personal/${this.userInfo.userId}`)
        this.$router.push({
          name: 'personal',
          params: { uid: this.userInfo.userId }
        })
    },
  },
  async created() {
    this.getHotSearch()
    this.getCurrentUserInfo()

    if (document.cookie.search('MUSIC_U=') != -1) {
      // 如果本地存有cookie，则先暂时判定为已登录，
      // 以解决登录状态下在视频页等需要登录的页面刷新因为登录状态默认为false，
      // 需要等待获取用户信息请求结束后更新用户状态才有进入视频页的权限，导致被返回到发现音乐页面，体验很差
      // 后面获取用户信息将再次确认用户是否登录
      this.$store.commit('updataLoginState', true)
    }
  },

  watch: {
    '$store.state.isLogin'(current) {
      // 如果退出登录后数据还没清空，则清空数据
      if (!current && this.userInfo.nickname) {
        this.userInfo = {}
      }
    }
  }
}
</script>

<style scoped>
@import './HeaderBar-element.css';
.headerBar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  position: relative;
  z-index: 30000;
}

.left {
  width: 110px;
  margin: 0 50px 0 30px;
  display: flex;
}

.left .logo {
  width: 100%;
  height: 30px;
  flex: 1;
}
.center {
  display: flex;
  align-items: center;
}

.buttons {
  color: rgb(235, 235, 235);
  /* display: flex; */
  height: 22px;
}

.buttons i {
  background-color: #202023;
  font-size: 12px;
  transform: scale(0.8);
  padding: 5px;
  height: 22px;
  width: 22px;
  border-radius: 50%;
  margin: 0 3px;
}

.right {
  display: flex;
  position: absolute;
  right: 50px;
  top: 0;
  line-height: 50px;
}

.user {
  display: flex;
  align-items: center;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 7px;
  cursor: pointer;
}

.avatar img {
  width: 100%;
}

.userName {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  width: 100px;
}

.loginButton {
  width: 100%;
  text-align: center;
}

.loginButton .el-button {
  width: 200px;
}

.el-form /deep/ .el-form-item__label {
  font-size: 13px !important;
}

.hotSearchTitle {
  font-size: 13px;
  margin: 10px 0 5px 20px;
  color: #ccc;
}

.hotSearchItem {
  display: flex;
  align-items: center;
  padding: 6.5px 15px;
  cursor: pointer;
}

.hotSearchItem:hover {
  background-color: #16181c;
}

.hotSearchIndex {
  margin-right: 15px;
  color: #aaa;
}

.topThree {
  color: #e13e3e;
}

.hotSearchWord {
  font-size: 12px;
  color: #ccc;
}

.hotSearchWordTopThree {
  font-weight: 600;
  color: #b82525;
}

.hotSearchContent {
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  color: #ccc;
}

.searchSuggest {
  font-size: 12px;
}

.searchSuggestItemTitle {
  background-color: #16181c;
  padding: 4px 8px;
  color: #ccc;
}

.searchSuggestItemTitle i {
  font-size: 15px;
  color: red;
}

.searchSuggestItem {
  cursor: pointer;
}

.suggestItemDetail {
  padding: 4px 27px;
  font-size: 12px;
  color: #ccc;
}

.suggestItemDetail:hover {
  background-color: #16181c;
}
::v-deep .el-input__inner:focus {
  color: #fff;
}
::v-deep .el-input__inner{
  color: #ac9999;
}
</style>
