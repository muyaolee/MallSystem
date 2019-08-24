// src -> main-dev.js

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入全局样式表
import './assets/css/global.css'

import TreeTable from 'vue-table-with-tree-grid'

import VueQuillEditor from 'vue-quill-editor'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor)

Vue.filter('dataFormat', function(str) {
    var date = new Date(str * 1000)
    var y = date.getFullYear()
    var mm = date.getMonth() + 1
    var d = date.getDate()
    var h = date.getHours()
    var m = date.getMinutes()
    var s = date.getSeconds()
    return `${y}-${mm}-${d} ${h}:${m}:${s}`
})

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

//axios请求拦截器
axios.interceptors.request.use(function(config) {
    NProgress.start()
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
}, function(error) {
    console.log(error)
})

//axios响应拦截器
axios.interceptors.response.use(function(config) {
    NProgress.done()
    return config
}, function(error) {
    console.log(error)
})

// 通过在原型上定义 使其在每个Vue的实例中可用
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 自定义指令来实现输入框自动获取焦点
// 我们绑定的不是真实的input而是el-input
// el-input渲染出来的是<div><input></div>
// Vue.directive('focus', {
//     inserted(el) {
//         el.querySelector('input').focus()
//     }
// })

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')