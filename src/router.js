// src -> router.js

import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'

// import Home from './components/Home.vue'
// import Welcome from './components/Welcome.vue'
// import Users from './components/user/Users.vue'
// import Rights from './components/power/Rights.vue'
// import Roles from './components/power/Roles.vue'
// import Cate from './components/goods/Cate.vue'
// import Params from './components/goods/Params.vue'
// import GoodsList from './components/goods/List.vue'
// import Add from './components/goods/Add.vue'
// import Order from './components/order/Order.vue'
// import Report from './components/report/Report.vue'

Vue.use(Router)

const router = new Router({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        {
            path: '/home',
            component: () =>
                import ( /* webpackChunkName: "home" */ './components/Home.vue'),
            redirect: '/welcome',
            children: [{
                    path: '/welcome',
                    component: () =>
                        import ( /* webpackChunkName: "home-welcome" */ './components/Welcome.vue')
                },
                {
                    path: '/users',
                    component: () =>
                        import ( /* webpackChunkName: "home-users" */ './components/user/Users.vue')
                },
                {
                    path: '/rights',
                    component: () =>
                        import ( /* webpackChunkName: "home-rights" */ './components/power/Rights.vue')
                },
                {
                    path: '/roles',
                    component: () =>
                        import ( /* webpackChunkName: "home-roles" */ './components/power/Roles.vue')
                },
                {
                    path: '/categories',
                    component: () =>
                        import ( /* webpackChunkName: "home-categories" */ './components/goods/Cate.vue')
                },
                {
                    path: '/params',
                    component: () =>
                        import ( /* webpackChunkName: "home-params" */ './components/goods/Params.vue')
                },
                {
                    path: '/goods',
                    component: () =>
                        import ( /* webpackChunkName: "home-goods" */ './components/goods/List.vue')
                },
                {
                    path: '/goods/add',
                    component: () =>
                        import ( /* webpackChunkName: "home-goods-add" */ './components/goods/Add.vue'),
                    name: 'Add'
                },
                {
                    path: '/orders',
                    component: () =>
                        import ( /* webpackChunkName: "home-orders" */ './components/order/Order.vue'),
                    name: 'Order'
                },
                {
                    path: '/reports',
                    component: () =>
                        import ( /* webpackChunkName: "home-reports" */ './components/report/Report.vue')
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.path == '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router