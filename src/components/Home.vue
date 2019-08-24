<template>
    <el-container class="home-container">
      <el-header>
        <div class="logo">
          <img src="../assets/header.png" alt="">
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
            <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
              <template slot="title">
                <i :class="iconsObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <el-menu-item @click="saveNavState(subItem.path)" :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>{{subItem.authName}}</span>
                </template>
            </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>
<script>
export default {
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('path')
  },
  data () {
    return {
      menuList: [],
      iconsObj: {
        '125':'iconfont icon-user',
        '103':'iconfont icon-tijikongjian',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    };
  },
    methods:{
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      async getMenuList(){
        const { data: res } = await this.$http.get('menus')
        if(res.meta.status != 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.menuList = res.data
      },
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      saveNavState(subItemPath) {
        sessionStorage.setItem('path', '/' + subItemPath)
      }
    }
}
</script>
<style lang='less' scoped>
    .home-container {
      height: 100%;
    }

    .el-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-left: 0;
      font-size: 20px;
      color: #fff;
      background: #373d41;
      .logo {
        display: flex;
        align-items: center;
        span {
          margin-left: 15px;
        }
      }
    }

    .el-aside {
      background: #333744;
    }

    .toggle-button {
      background-color: #4A5064;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      text-align: center;
      cursor: pointer;
    }

    .el-menu {
      border-right: none;
    }

    .iconfont {
      margin-right: 10px;
    }

    .el-main {
      background: #eaedf1;
    }
</style>