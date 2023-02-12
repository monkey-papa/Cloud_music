import Vue from 'vue'
import App from './App.vue'
// 全局样式表
import './plugins/element'
import "./assets/css/base.css"
import 'element-ui/lib/theme-chalk/index.css';
import { MessageBox } from 'element-ui'
Vue.prototype.$confirm = MessageBox.confirm
//引入阿里图标
import "@/assets/iconfont/iconfont.css";
import "@/assets/iconfont/geci/iconfont.css";

import router from './router/index'
import store from './store/index'
import { request } from "./network/request";

Vue.prototype.$request = request;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
