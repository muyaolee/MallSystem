<template>
    <div>
        <!-- 面包屑导航 S -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 面包屑导航 E -->
        <!-- 卡片视图区域 S -->
        <el-card>
            <!-- 添加角色按钮区域 S -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 添加角色按钮区域 E -->
            <!-- 角色列表区域 S -->
            <el-table :data="rolesList" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', index1 == 0 ? 'bdtop' : '']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
                            <el-col :span="5">
                                <el-tag closable @close="removeRightsTag(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row :class="[index2 == 0 ? '' : 'bdtop']" v-for="(item2, index2) in item1.children" :key="item2.id">
                                    <el-col :span="5">
                                        <el-tag type="success" closable @close="removeRightsTag(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="19">
                                        <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="removeRightsTag(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(scope.row)">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetrightsDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 角色列表区域 E -->
        </el-card>
        <!-- 卡片视图区域 E -->
        <!-- 添加角色对话框 S -->
        <el-dialog
            title="添加角色"
            :visible.sync="addRoleDialogVisible"
            width="50%"
            @close="addRoleDialogClosed">
            <el-form
                :model="addRoleForm"
                :rules="roleFormRules"
                ref="addRoleFormRef"
                label-width="100px">
                <el-form-item label="角色名称：" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述：" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 添加角色对话框 E -->
        <!-- 修改角色对话框 S -->
        <el-dialog
            title="修改角色"
            :visible.sync="editRoleDialogVisible"
            width="50%"
            @close="editRoleDialogClosed">
            <el-form
                :model="editRoleForm"
                :rules="roleFormRules"
                ref="editRoleFormRef"
                label-width="100px">
                <el-form-item label="角色名称：" prop="roleName">
                    <el-input v-model="editRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述：" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改角色对话框 E -->
        <!-- 分配权限对话框 S -->
        <el-dialog
            title="分配权限"
            :visible.sync="setRightsDialogVisible"
            width="50%">
            <el-tree ref="treeRef" :data="rightsList" :props="defaultProps" node-key="id" :default-checked-keys="defKeys" show-checkbox default-expand-all></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限对话框 E -->
    </div>
</template>

<script>
export default {
    created () {
        this.getRolesList()
    },
    data () {
        return {
            rolesList: [],
            rightsList: [],
            setRightsDialogVisible: false,
            defaultProps: {
                label:'authName',
                children: 'children'
            },
            defKeys: [],
            roleId: '',
            addRoleDialogVisible: false,
            addRoleForm: {
                roleId: 0,
                roleName: '',
                roleDesc: ''
            },
            roleFormRules: {
                roleName: [
                    {required: true, message: '请输入角色名称', trigger: 'blur'},
                    {min: 2, max: 10, message: '角色名称长度在2到10个字符之间', trigger: 'blur'}
                ],
                roleDesc: [
                    {required: true, message: '请输入角色描述', trigger: 'blur'},
                    {min: 2, max: 10, message: '角色描述长度在2到10个字符之间', trigger: 'blur'}
                ]
            },
            editRoleDialogVisible: false,
            editRoleForm: {
                roleId: 0,
                roleName: '',
                roleDesc: ''
            },
        };
    },
    methods: {
        async getRolesList() {
            const {data: res} = await this.$http.get('roles')
            if (res.meta.status != 200) return this.$message.error('获取角色列表失败')
            this.rolesList = res.data
        },
        showAddRoleDialog() {
            this.addRoleDialogVisible = true
        },
        addRole() {
            this.$refs.addRoleFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.post('roles', this.addRoleForm)
                if (res.meta.status != 201) return this.$message.error('添加角色失败')
                this.getRolesList()
                this.addRoleDialogVisible = false
            })
        },
        addRoleDialogClosed() {
            this.$refs.addRoleFormRef.resetFields()
        },
        async showEditRoleDialog(row) {
            const {data: res} = await this.$http.get(`roles/${row.id}`)
            this.editRoleForm = res.data
            this.editRoleDialogVisible = true
        },
        editRole() {
            this.$refs.editRoleFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.put(`roles/${this.editRoleForm.roleId}`, {
                    roleName: this.editRoleForm.roleName,
                    roleDesc: this.editRoleForm.roleDesc
                })
                    if (res.meta.status != 200) return this.$message.error('修改角色失败')
                    this.$message.success('修改角色成功')
                    this.getRolesList()
                    this.editRoleDialogVisible = false
            })
        },
        editRoleDialogClosed() {
            this.$refs.editRoleFormRef.resetFields()
        },
        deleteRole(row) {
            this.$confirm('此操作将永久删除当前角色，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(async() => {
                const { data: res } = await this.$http.delete(`roles/${row.id}`)
                if (res.meta.status != 200) return this.$message.error('删除角色失败')
                this.getRolesList()
                }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });          
                });  
        },
        removeRightsTag(role, rightId) {
            this.$confirm('此操作将删除当前权限，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(async() => {
                    const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                    if (res.meta.status != 200) return this.$message.error('删除角色权限失败')
                    role.children = res.data
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });          
            });
        },
        async showSetrightsDialog(row) {
            this.roleId = row.id

            const {data: res} = await this.$http.get('rights/tree')
            if (res.meta.status != 200) return this.$message.error('获取权限列表失败')
            this.rightsList = res.data
            this.setRightsDialogVisible = true

            var rightsArr = []
            function fn(arr) {
                for (var i = 0; i < arr.length; i++) {    
                    if (arr[i].children) {
                        fn(arr[i].children)
                    } else {
                        rightsArr.push(arr[i].id)
                    }
                }
            }
            fn(row.children)
            this.defKeys = rightsArr
        },
        async allotRights() {
            var ids = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
            ids = ids.join(',')
            const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: ids})
            if (res.meta.status !=200) return this.$message.error('分配权限失败')
            this.$message.success('分配权限成功')
            this.getRolesList()
            this.setRightsDialogVisible = false
        }
    }
}
</script>

<style lang='less' scoped>
    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }

    .el-tag {
       margin: 7px;
    }
</style>