import axios from 'axios'
import vuex from '../store/index'
import { Message } from 'element-ui'

// 该项目所有请求均为 get请求
export function request(url, params) {
  // 请求超过30秒则判定为超时
  const instance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    withCredentials: true
  })

  // axios拦截器
  // 请求拦截
  instance.interceptors.request.use(
    config => {
      return config
    },
    err => {
      console.log(err)
    }
  )

  // 响应拦截
  instance.interceptors.response.use(
    config => {
      const code = config.data.code
      if (code !== 200 && !(code >= 800 && code <= 803)) Message.error(config.data.message || '未知错误, 请打开控制台查看')
      return config
    },
    err => {
      console.log([err])
      if (err.response.data.msg === '需要登录') {
        // 修改当前的登录状态
        vuex.state.isLogin = false
      } else {
        Message.error(err.response.data.message || '未知错误, 请打开控制台查看')
      }
    }
  )

  instance.defaults.withCredentials = true

  if (params) {
    const query = { params }
    return instance.get(url, query)
  } else {
    return instance.get(url)
  }
}
