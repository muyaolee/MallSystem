// vue.config.js的作用
// 默认vue脚手架配置项不满足我们的需求，我们创建vue.config.js在里面写配置，覆盖默认的配置项（自定义）

module.exports = {
    chainWebpack: config => {
        // 开发
        config.when(process.env.NODE_ENV === 'development', config => {
            config.entry('app').clear().add('./src/main-dev.js')

            // 使用插件
            config.plugin('html').tap(args => {
                // 添加参数isProd
                args[0].isProd = true
                return args
            })
        })

        // 生产（上线）
        config.when(process.env.NODE_ENV === 'production', config => {
            config.entry('app').clear().add('./src/main-prod.js')

            config.set('externals', {
                vue: 'Vue',
                'vue-router': 'VueRouter',
                axios: 'axios',
                lodash: '_',
                echarts: 'echarts',
                nprogress: 'NProgress',
                'vue-quill-editor': 'VueQuillEditor'
            })

            // 使用插件
            config.plugin('html').tap(args => {
                // 添加参数isProd
                args[0].isProd = false
                return args
            })
        })
    }
}