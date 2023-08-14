<template>
  <el-button @click="clickFn" :disabled="countdown !== 0">{{ btnMsg }}</el-button>
</template>

<script>
export default {
  props: {
    btnOpt: {
      type: Object,
      default() {
        return {}
      }
    },
    callback: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      countdown: 0,
      defaultBtnOpt: {
        timingMsg: '重新获取',
        clickMsg: '获取验证码',
        countdown: 60,
        ...this.btnOpt
      }
    }
  },
  methods: {
    async clickFn() {
      const flag = this.callback && (await this.callback())
      // 需要callback返回true才继续向下执行
      if (!flag) return

      this.countdown = this.defaultBtnOpt.countdown * 1
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown === 0) clearInterval(timer)
      }, 1000)
    }
  },
  computed: {
    btnMsg() {
      return this.countdown ? `${this.countdown}s后${this.defaultBtnOpt.timingMsg}` : `点击${this.defaultBtnOpt.clickMsg}`
    }
  }
}
</script>

<style></style>
