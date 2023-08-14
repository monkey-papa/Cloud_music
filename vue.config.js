/* 先引入打包分析插件 */
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const cdn = {
  css: ['https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.1/theme-chalk/index.min.css'],
  js: [
    'https://cdn.bootcdn.net/ajax/libs/vue/2.6.12/vue.min.js',
    'https://cdn.bootcdn.net/ajax/libs/vuex/3.6.2/vuex.min.js',
    'https://cdn.bootcdn.net/ajax/libs/vue-router/3.5.1/vue-router.min.js',
    'https://cdn.bootcdn.net/ajax/libs/axios/0.21.1/axios.min.js'
  ]
}
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        assets: '@/assets',
        common: '@/common',
        components: '@/components',
        network: '@/network',
        views: '@/views',
        plugins: '@/plugins'
      }
    },
    plugins: [
      // 依赖大小分析工具
      new BundleAnalyzerPlugin()
    ],
    //这就是在告诉Webpack：请不要将这个模块注入编译后的JS文件里，对于我源代码里出现的任何import/require这个模块的语句，请将它保留。
    externals: {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
      axios: 'axios'
    }
  },
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false, // 打包成 web页面 使用，一般建议 false，不然会生成很多map文件
  chainWebpack(config) {
    // 引入CDN
    // webpack需要排除的依赖名称和挂载在window上的对象属性名称
    config.set('externals', cdn.externals)
    config.plugin('html').tap(args => {
      args[0].cdn = cdn
      return args
    })
  },
  devServer: {
    proxy: {
      '/api': {
        // target: 'https://www.codeman.store',
        target: 'http://www.codeman.ink:3000',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      // '/api': {
      //     target: 'http://101.42.54.70:3000',
      //     changeOrigin: true,
      //     ws: true,
      //     pathRewrite: {
      //         '^/api': ''
      //     }
      // },
      m7: {
        target: 'http://m7.music.126.net',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/m7': ''
        }
      },
      m701: {
        target: 'http://m701.music.126.net',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/m701': ''
        }
      },
      m8: {
        target: 'http://m8.music.126.net',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/m8': ''
        }
      },
      m801: {
        target: 'http://m801.music.126.net',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/m801': ''
        }
      }
    },
    disableHostCheck: true
  }
}
