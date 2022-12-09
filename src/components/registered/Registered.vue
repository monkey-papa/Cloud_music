<template>
  <el-dialog
    :visible="isDialogShow"
    custom-class="registeredDialog"
    width="400px"
    append-to-body
    @close="closeRegistered"
  >
    <div class="registeredContainer">
      <div class="logo">
        <img src="~assets/img/registered.png" alt="" />
      </div>
      <!-- 第一步 -->
      <el-form class="form" :model="userInfo" v-if="currentStep == 0">
        <el-form-item>
          <el-input
            class="mobile"
            prefix-icon="el-icon-mobile-phone"
            size="small"
            placeholder="请输入手机号"
            v-model="userInfo.mobile"
          ></el-input></el-form-item
        ><el-form-item>
          <el-input
            class="password"
            prefix-icon="el-icon-lock"
            size="small"
            placeholder="设置登录密码"
            type="password"
            v-model="userInfo.password"
          ></el-input>
          <div class="tip">
            密码8~20位，至少包含字母/数组/字符2中组合
          </div></el-form-item
        >
        <el-form-item>
          <el-button
            @click="submitCount"
            size="small"
            :loading="isButtonLoading"
            >注册</el-button
          >
        </el-form-item>
      </el-form>
      <!-- 第二步 -->
      <el-form class="form" v-else-if="currentStep == 1">
        <el-form-item class="codeInput">
          <el-input
            class="mobile"
            prefix-icon="el-icon-key"
            size="small"
            placeholder="请填写验证码"
            v-model="code"
          ></el-input>
          <div class="codeButtonContainer">
            <div class="codeButton" v-if="!isCountDownShow" @click="getCode">
              获取验证码
            </div>
            <div class="countDown" v-else>{{ countDown }}<span>s</span></div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button @click="submitCode" size="small" :loading="isButtonLoading"
            >下一步</el-button
          >
        </el-form-item>
      </el-form>
      <!-- 第三步 -->
      <el-form class="form" v-else-if="currentStep == 2">
        <el-form-item>
          <el-input
            class="mobile"
            prefix-icon="el-icon-user"
            size="small"
            placeholder="请填写昵称"
            v-model="userInfo.nickname"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="finishRegistered"
            size="small"
            :loading="isButtonLoading"
            >完成注册</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
// 倒计时的定时器名称
let timer;

export default {
  name: "Registered",
  props: {
    isDialogShow: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      // 当前注册的步骤索引
      currentStep: 0,
      // 用户信息
      userInfo: {
        mobile: "",
        password: "",
        nickname: "",
      },
      code: "",
      //   按钮是否正在加载
      isButtonLoading: false,
      // 倒计时时长
      countDown: 60,
      //   是否显示倒计时
      isCountDownShow: false,
    };
  },
  methods: {
    // 请求
    //   发送验证码
    async getCode() {
      let getCode = await this.$request("/captcha/sent", {
        phone: this.userInfo.mobile,
      });
      console.log(getCode);

      if (getCode.data.code == 200) {
        //   开始倒计时
        this.countDown = 60;
        this.isCountDownShow = true;
        timer = setInterval(() => {
          if (this.countDown == 0) {
            clearInterval(timer);
            this.isCountDownShow = false;
            return;
          }
          this.countDown--;
        }, 1000);
      } else {
        this.$message.error(getCode.data.message);
      }
    },

    // 点击注册的回调
    async submitCount() {
      console.log("注册");
      // 按钮设为加载状态
      this.isButtonLoading = true;

      if (
        this.userInfo.password.length < 8 ||
        this.userInfo.mobile.length != 11
      ) {
        this.$message.warning("手机号码或者密码格式错误!");
        this.isButtonLoading = false;
        return;
      }

      // 先验证手机号是否已经存在
      let verifyMobile = await this.$request("/cellphone/existence/check", {
        phone: this.userInfo.mobile,
      });

      console.log(verifyMobile);
      // 如果手机号不存在 发送验证码
      if (verifyMobile.data.exist !== 1) {
        await this.getCode();
        // 请求结束后按钮设为正常状态
        this.isButtonLoading = false;
        // 进入注册第二个步骤
        this.currentStep = 1;
      } else {
        // 请求结束后按钮设为正常状态
        this.isButtonLoading = false;
        this.$message.warning("此手机号已经注册过了哦,请直接登录!");
        // 关闭当前注册框
        this.$emit("closeRegistered");
      }
    },

    // 点击提交验证码的回调
    async submitCode() {
      console.log("验证验证码");
      // 按钮设为加载状态
      this.isButtonLoading = true;

      if (this.code.length != 4) {
        this.isButtonLoading = false;
        this.$message.warning("验证码格式错误!");
        return;
      }

      let verifyCode = await this.$request("/captcha/verify", {
        phone: this.userInfo.mobile,
        captcha: this.code,
      }).catch((err) => {
        this.$message.error(err.response.data.message);

        // 重置按钮状态
        this.isButtonLoading = false;
      });

      if (!verifyCode) {
        return;
      }
      // 请求结束后按钮设为正常状态
      this.isButtonLoading = false;
      console.log(verifyCode);
      if (verifyCode.data.data) {
        // 验证通过
        // 进入注册第三个步骤   设置昵称
        this.currentStep = 2;
      }
    },

    // 点击完成注册的回调
    async finishRegistered() {
      // 按钮设为加载状态
      this.isButtonLoading = true;
      let res = await this.$request("/register/cellphone", {
        captcha: this.code,
        phone: this.userInfo.mobile,
        password: this.userInfo.password,
        nickname: this.userInfo.nickname,
      }).catch((err) => {
        this.$message.error(err.response.data.message);

        // 重置按钮状态
        this.isButtonLoading = false;
      });

      if (!res) {
        return;
      }

      // 请求结束后按钮设为正常状态
      this.isButtonLoading = false;
      console.log(res);
      if (res.data.code == 200) {
        this.$message.success("注册成功!");
        this.$emit("closeRegistered");
      } else {
        this.$message.error("注册失败!");
      }
    },

    // 点击关闭注册框的回调
    closeRegistered() {
      // 重置所有数据
      this.userInfo = {
        mobile: "",
        password: "",
        nickname: "",
      };
      this.currentStep = 0;
      this.code = "";
      this.isButtonLoading = false;
      this.isCountDownShow = false;
      this.countDown = 60;

      this.$emit("closeRegistered");
    },
  },
};
</script>

<style scoped>
.registeredContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 50%;
}

.logo img {
  width: 100%;
}

.form {
  width: 100%;
  text-align: center;
}

.form .el-input /deep/ input {
  background-color: white !important;
  border: 1px solid #ccc;
  margin: 10px 0;
  color: rgb(95, 95, 95) !important;
}

.form .el-input /deep/input::-webkit-input-placeholder {
  color: #ccc !important;
  font-size: 12px;
}

.form .el-input /deep/ .el-input__icon {
  color: #aaa;
  width: 14px;
  height: 105%;
}

.form /deep/ .el-form-item {
  margin: 0;
}

.el-button {
  background-color: #ea4848;
  color: white;
  width: 80%;
  border: none;
  height: 33px;
  margin-top: 20px;
  border-radius: 5px;
}

.el-button:hover {
  color: white;
  background-color: #f02e2e;
}

.el-button:focus {
  color: white;
}

.tip {
  font-size: 12px;
  color: #bbb;
  line-height: 10px;
  transform: scale(0.9) translate(-1%, -30%);
}

.codeInput {
  position: relative;
}

.codeButtonContainer {
  position: absolute;
  right: 48px;
  top: 14px;
}

.codeButton {
  background-color: #ea4848;
  color: rgb(245, 245, 245);
  font-size: 12px;
  padding: 5px 12px;
  line-height: 15px;
  border-radius: 5px;
  transform: scale(0.9);
  cursor: pointer;
}

.codeButton:hover {
  background-color: #f02e2e;
}

.countDown {
  color: rgb(134, 134, 134);
  line-height: 25px;
  font-size: 12px;
}

.countDown span {
  margin-left: 1px;
}
</style>
