<template>
  <div class="Login">
    <el-tabs stretch>
      <el-tab-pane label="二维码登录" lazy>
        <qr-code-login @getUserInfo="getUserInfo" />
        <div class="tips">提示: 请使用网易云音乐app扫码登陆</div>
      </el-tab-pane>
      <el-tab-pane label="验证码登录" lazy>
        <verify-code-login />
        <div class="tips" style="margin-top: 10px">提示: 手机号登录被和谐, 请使用二维码登录</div>
      </el-tab-pane>
    </el-tabs>

    <div class="regEnter" @click="$emit('update:isRegisteredShow', true)">注册</div>
  </div>
</template>

<script>
import verifyCodeLogin from './components/verifyCodeLogin'
import qrCodeLogin from './components/qrCodeLogin'

export default {
  components: { verifyCodeLogin, qrCodeLogin },
  name: 'Login',
  props: {
    isRegisteredShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  methods: {
    getUserInfo(info) {
      this.$emit('getUserInfo', info)
    }
  }
}
</script>

<style lang="less" scoped>
.regEnter {
  width: 100%;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  margin: 15px auto 0;
}

.regEnter:hover {
  text-decoration: underline;
}

.tips {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

::v-deep .el-tabs__item {
  color: #b82525 !important;
}
</style>
