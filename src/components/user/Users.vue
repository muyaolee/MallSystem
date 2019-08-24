<template>
    <div>
      <!-- 面包屑导航 S -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 面包屑导航 E -->
      <!-- 卡片视图区域 S -->
      <el-card>
        <!-- 搜索与添加区域 S -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              placeholder="请输入搜索内容"
              class="input-with-select"
              v-model="queryInfo.query"
              clearable
              @clear="getUserList"
              @keyup.enter.native="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="16">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
        <!-- 搜索与添加区域 E -->
        <!-- 表格数据区域 S -->
        <el-table :data="userList" border stripe>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="姓名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <el-table-column label="状态" prop="mg_state">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUser(scope.row.id)"></el-button>
              <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoleDialog(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!-- 表格数据区域 E -->
        <!-- 分页 S -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[2, 5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
        <!-- 分页 E -->
      </el-card>
      <!-- 卡片视图区域 E -->
      <!-- 添加用户对话框 S -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
        <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">添 加</el-button>
        </span>
      </el-dialog>
      <!-- 添加用户对话框 E -->
      <!-- 修改用户对话框 S -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
        <el-form ref="editFormRef" :model="editForm" :rules="addFormRules" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">修 改</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户对话框 E -->
      <!-- 分配角色对话框 S -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        @close="setRoleDialogClosed">
        <div>
          <p>当前的用户：{{userInfo.username}}</p>
          <p>当前的角色：{{userInfo.role_name}}</p>
          <p>
            <span>分配新角色：</span>
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 E -->
    </div>
</template>

<script>
export default {
  created() {
    this.getUserList()
  },
  data () {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }

    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号码'))
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 10, message: '用户名长度在3到10个字符之间', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 15, message: '密码长度在6到15个字符之间', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱地址', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      editDialogVisible: false,
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      setRoleDialogVisible: false,
      userInfo: {},
      roleList: [],
      selectedRoleId: ''
    };
  },
    methods: {
      async getUserList() {
        const { data: res } = await this.$http.get('users', {params: this.queryInfo})
        if (res.meta.status != 200) return this.$message.error('获取用户列表失败')
        this.userList = res.data.users
        this.total = res.data.total
      },
      handleSizeChange(pagesize) {
        this.queryInfo.pagesize = pagesize
        this.getUserList()
      },
      handleCurrentChange(pagenum) {
        this.queryInfo.pagenum = pagenum
        this.getUserList()
      },
      async userStateChange(row) {
        const { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
        if (res.meta.status != 200) return this.$message.error('修改用户状态失败')
        this.$message.success('修改用户状态成功')
      },
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.post('users', this.addForm)
          if (res.meta.status != 201) return this.$message.error('添加用户失败')
          this.$message.success('添加用户成功')
          this.addDialogVisible = false
          this.getUserList()
        })
      },
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('users/' + id)
        if (res.meta.status != 200) return this.$message.error('查询用户失败')
        this.editForm = res.data
        this.editDialogVisible = true
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      editUser() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.put('users/' + this.editForm.id, {email: this.editForm.email, mobile: this.editForm.mobile})
          if (res.meta.status != 200) return this.$message.error('修改用户失败')
          this.$message.success('修改用户成功')
          this.editDialogVisible = false
          this.getUserList()
        })
      },
      removeUser(id) {
        this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          const {data: res} = await this.$http.delete('users/' + id)
          if (res.meta.status != 200) return this.$message.error('删除用户失败')
          this.$message.success('删除用户成功')
          this.getUserList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      async setRoleDialog(row) {
        this.userInfo = row
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status != 200) return this.$message.error('获取角色列表失败')
        this.roleList = res.data
        this.setRoleDialogVisible = true
      },
      async saveRole() {
        if (!this.selectedRoleId) return this.$message.error('请选择要分配的角色')   
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})
        if (res.meta.status != 200) return this.$message.error('分配角色失败')
        this.$message.success('分配角色成功')
        this.setRoleDialogVisible = false
        this.getUserList()
      },
      setRoleDialogClosed() {
        this.userInfo = {}
        this.selectedRoleId = ''
      }
    }
}
</script>

<style lang='less' scoped>
    
</style>