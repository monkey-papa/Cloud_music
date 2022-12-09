import axios from 'axios'
import vuex from '../store/index'

// 该项目所有请求均为 get请求
export function request(url, params) {
    // 请求超过30秒则判定为超时
    const instance = axios.create({
        baseURL: '/api',
        timeout: 30000,
        withCredentials: true,
    });

    // axios拦截器
    // 请求拦截
    instance.interceptors.request.use(config => {
        // console.log('请求拦截器');
        return config
    }, err => {
        console.log(err);
    });

    // 响应拦截
    instance.interceptors.response.use(config => {
        return config;
    }, err => {
        console.log([err]);
        if (err.response.data.msg == '需要登录') {
            // cookie过期 退出登录
            // console.log(window.localStorage.getItem("userInfo"));
            // window.localStorage.setItem("userInfo", "");
            // 刷新页面
            // history.go(0)
            // 修改当前的登录状态
            vuex.state.isLogin = false;
        } else {
            console.log(err.response.data.msg);
        }
    });
//允许跨域携带cookie信息
    instance.defaults.withCredentials = true;

    if (params) {
        params = {
            params: params
        }
        return instance.get(url, params)
    } else {
        return instance.get(url)
    }

}