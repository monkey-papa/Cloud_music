<template>
  <el-form ref="form" :model="loginForm" label-width="70px" label-position="right" :rules="rules" size="mini">
    <el-form-item label="手机号:" prop="phone">
      <input type="text" v-model="loginForm.phone" class="loginInput" />
    </el-form-item>
    <el-form-item label="验证码:" prop="captcha" class="captcha">
      <input type="text" v-model="loginForm.captcha" class="loginInput" />
      <timer-button class="btn-primary" :callback="getVerifyCode" />
    </el-form-item>
    <div class="loginButton">
      <el-button type="danger" @click="login" size="mini">登录</el-button>
    </div>
  </el-form>
</template>

<script>
import timerButton from '@/components/timerButton'
import { getVerifyCode, login } from '../../servers'

export default {
  name: 'verifyCodeLogin',
  components: { timerButton },
  data() {
    return {
      loginForm: {
        captcha: '',
        phone: ''
      },
      rules: {
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      }
    }
  },

  methods: {
    // 事件
    // 点击登录按钮的回调
    login() {
      this.$refs['form'].validate(async valid => {
        if (!valid) return
        const result = await login(this.loginForm)
        if (result.data.code == 200) {
          // 将请求到的用户id存入localstorage
          // 在index.vue 和 bottomControl.vue中用到过
          window.localStorage.setItem('userId', result.data.profile.userId)
          // 将userInfo传回父组件
          this.$emit('getUserInfo', result.data.profile)

          this.$message.success('登录成功!')
          // 修改vuex中的登录状态
          this.$store.commit('updataLoginState', true)
        }
      })
    },

    async getVerifyCode() {
      const phone = this.loginForm.phone
      if (!phone) {
        this.$refs['form'].validateField('phone')
        return false
      }

      const res = await getVerifyCode({ phone })
      return res.data.code === 200
    }
  }
}
</script>

<style lang="less" scoped>
.loginInput {
  height: 28px;
  border-radius: 5px;
  outline: none;
  border: 1px solid #999;
  padding-left: 5px;
}

.el-form {
  padding-top: 10px;
}

.loginButton {
  width: 100%;
  text-align: center;
}

.loginButton .el-button {
  width: 200px;
}

/deep/ .el-form-item__content {
  display: flex;

  input {
    width: 100%;
  }
}

.captcha {
  input {
    min-width: 50px;
    margin-right: 10px;
  }
}
</style>
