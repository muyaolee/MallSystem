<template>
    <div>
        <!-- 面包屑导航 S -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 面包屑导航 E -->
        <!-- 卡片视图区域 S -->
        <el-card>
            <!-- 警告区域 S -->
            <el-alert
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                :closable="false"
                show-icon>
            </el-alert>
            <!-- 警告区域 E -->
            <!-- 选择商品分类区域 S -->
            <div class="cat_opt">
                <span>选择商品分类：</span>
                <el-cascader
                    v-model="selectedCateKeys"
                    :options="cateList"
                    :props="cateProps"
                    @change="handleChange"
                    clearable>
                </el-cascader>
            </div>
            <!-- 选择商品分类区域 E -->
            <!-- Tabs标签页区域 S -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag
                                    :key="index"
                                    v-for="(item, index) in scope.row.attr_vals"
                                    closable
                                    @close="handleClose(index, scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                        <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag
                                    :key="index"
                                    v-for="(item, index) in scope.row.attr_vals"
                                    closable
                                    @close="handleClose(index, scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
            <!-- Tabs标签页区域 E -->
        </el-card>
        <!-- 卡片视图区域 E -->
        <!-- 添加的对话框 S -->
        <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogclosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 添加的对话框 E -->
        <!-- 修改的对话框 S -->
        <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogclosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改的对话框 E -->
    </div>
</template>

<script>
export default {
    created() {
        this.getCateList()
    },
    data() {
        return {
            cateList: [],
            // 级联选择框的配置对象
            cateProps: {
                expandTrigger: 'hover',
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            },
            // 级联选择框双向绑定的数组
            selectedCateKeys: [],
            activeName: 'many',
            manyTableData: [],
            onlyTableData: [],
            addDialogVisible: false,
            addForm: {
                attr_name: ''
            },
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            editDialogVisible: false,
            editForm: {
                attr_name: ''
            },
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        async getCateList() {
            const {data: res} = await this.$http.get('categories')
            if (res.meta.status != 200) return this.$message.error('获取商品分类数据失败')
            this.cateList = res.data
        },
        // 级联选择框变化的时候会触发
        handleChange() {
            this.getParamsData()
        },
        handleTabClick() {
            this.getParamsData()
        },
        async getParamsData() {
            if (this.selectedCateKeys.length != 3) {
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return
            }

            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                params: { sel: this.activeName }
            })
            if (res.meta.status != 200) return this.$message.error('获取参数列表数据失败')
            
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                // 为每个数据行添加自己的inputVisible，从而控制自己展开行中的输入框的显示与隐藏
                item.inputVisible = false
                // 把文本框中输入的值双向绑定到item.inputValue上
                item.inputValue = ''
            })

            if (this.activeName == 'many') {
                this.manyTableData = res.data
            } else {
                this.onlyTableData = res.data
            }
        },
        addDialogclosed() {
            this.$refs.addFormRef.resetFields()
        },
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status != 201) return this.$message.error('添加参数失败')
                this.$message.success('添加参数成功')
                this.getParamsData()
                this.addDialogVisible = false
            })
        },
        async showEditDialog(attr_id) {
            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {params: {
                attr_sel: this.activeName
            }})
            if (res.meta.status != 200) return this.$message.error('获取参数失败')
            this.editForm = res.data
            this.editDialogVisible = true
        },
        editDialogclosed() {
            this.$refs.editFormRef.resetFields()
        },
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status != 200) return this.$message.error('修改参数失败')
                this.$message.success('修改参数成功')
                this.getParamsData()
                this.editDialogVisible = false
            })
        },
        removeParams(row) {
            this.$confirm('此操作将删除当前参数，是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(async() => {
                const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${row.attr_id}`)
                if (res.meta.status != 200) return this.$message.error('删除参数失败')
                this.$message.success('删除参数成功')
                this.getParamsData()
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        handleInputConfirm(row) {
            if(row.inputValue.trim().length == 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }

            // 如果没有return，则证明输入的内容需要做后续处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false

            this.saveAttrVals(row)
        },
        showInput(row) {
            row.inputVisible = true
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        handleClose(index, row) {
            row.attr_vals.splice(index, 1)
            this.saveAttrVals(row)
        },
        async saveAttrVals(row) {
            const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(',')
            })
            if (res.meta.status != 200) return this.$message.error('修改参数失败')
            this.$message.success('修改参数成功')
        }
    },
    computed: {
        isBtnDisabled() {
            return this.selectedCateKeys.length != 3
        },
        cateId() {
            return this.selectedCateKeys[this.selectedCateKeys.length - 1]
        },
        titleText() {
            if (this.activeName == 'only') {
                return '静态属性'
            }
            return '动态参数'
        }
    }
}
</script>

<style lang='less' scoped>
    .cat_opt {
        margin: 15px 0;
    }

    .el-tag {
        margin: 10px;
    }

    .input-new-tag {
        width: 150px;
    }
</style>