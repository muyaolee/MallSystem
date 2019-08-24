<template>
    <div>
        <!-- 面包屑导航 S -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 面包屑导航 E -->
        <!-- 卡片视图区域 S -->
        <el-card>
            <!-- 添加分类按钮区域 S -->
            <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            <!-- 添加分类按钮区域 E -->
            <!-- 表格 S -->
            <tree-table
                class="treetable"
                :data="cateList"
                :columns="columns"
                border
                tree-type
                show-index
                index-text="#"
                :show-row-hover="false"
                :selection-type="false"
                :expand-type="false">
                <template slot="isOk" slot-scope="scope">
                    <i v-if="scope.row.cat_deleted == false" class="el-icon-success" style="color: lightgreen;"></i>
                    <i v-else class="el-icon-error" style="color: red;"></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level == 0" size="mini">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level == 1" type="success" size="mini">二级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level == 2" type="warning" size="mini">三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
            <!-- 表格 E -->
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
        <!-- 添加分类对话框 S -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%"
            @close="closeAddCateDialog">
            <!-- 添加分类的表单 S -->
            <el-form
                :model="addCateForm"
                :rules="addCateFormRules"
                ref="addCateFormRef"
                label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <el-cascader
                        v-model="selectedKeys"
                        :options="parentCateList"
                        :props="cascaderProps"
                        @change="parentCateChange"
                        clearable>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <!-- 添加分类的表单 E -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 添加分类对话框 E -->
        <!-- 编辑分类对话框 S -->
        <el-dialog
            title="修改分类"
            :visible.sync="editCateDialogVisible"
            width="50%">
            <el-form
                :model="editCateForm"
                :rules="addCateFormRules"
                ref="editCateFormRef"
                label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑分类对话框 S -->
    </div>
</template>

<script>
    export default {
        created() {
            this.getCateList()
        },
        data() {
            return {
                // 查询条件
                queryInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                // 商品分类的数据列表
                cateList: [],
                // 总数据条数
                total: 0,
                // 为table指定列的定义
                // type表示将当前列定义为模板列
                columns: [
                    { label: '分类名称', prop: 'cat_name' },
                    { label: '是否有效', type: 'template', template: 'isOk' },
                    { label: '排序', type: 'template', template: 'order' },
                    { label: '操作', type: 'template', template: 'opt' }
                ],
                addCateDialogVisible: false,
                addCateForm: {
                    cat_pid: 0,
                    cat_level: 0,
                    cat_name: ''
                },
                addCateFormRules: {
                    cat_name: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' }
                    ]
                },
                // 父级分类的列表
                parentCateList: [],
                // 选中的父级分类的Id数组
                selectedKeys: [],
                // 指定级联选择器的配置对象
                // 通过checkStrictly来设置父子节点取消选中关联，从而达到选择任意一级选项的目的
                cascaderProps: {
                    checkStrictly: true,
                    expandTrigger: 'hover',
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children'
                },
                editCateDialogVisible: false,
                editCateForm: {
                    cat_name: '',
                    cat_id: 0
                }
            }
        },
        methods: {
            async getCateList() {
                const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
                if (res.meta.status != 200) return this.$message.error('获取商品分类失败') 
                this.cateList = res.data.result
                this.total = res.data.total
            },
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getCateList()
            },
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getCateList()
            },
            showAddCateDialog() {
                this.getParentCateList()
                this.addCateDialogVisible = true
            },
            async getParentCateList() {
                const {data: res} = await this.$http.get('categories', {params: {type: 2}})
                if (res.meta.status != 200) return this.$message.error('获取父级分类数据失败')
                this.parentCateList = res.data          
            },
            parentCateChange() {
                if (this.selectedKeys.length == 0) {
                    this.addCateForm.cat_pid = 0
                    this.addCateForm.cat_level = 0
                } else {
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                    this.addCateForm.cat_level = this.selectedKeys.length
                }
            },
            addCate() {
                this.$refs.addCateFormRef.validate(async valid => {
                    if (!valid) return
                    const {data: res} = await this.$http.post('categories', this.addCateForm)
                    if (res.meta.status != 201) return this.$message.error('添加分类失败')
                    this.addCateDialogVisible = false
                    this.getCateList()
                })
            },
            closeAddCateDialog() {
                this.$refs.addCateFormRef.resetFields()
                this.selectedKeys = []
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            },
            async showEditCateDialog(id) {
                const {data: res} = await this.$http.get('categories/' + id)
                if (res.meta.status != 200) return this.$message.error('查询分类失败')
                this.editCateForm = res.data
                this.editCateDialogVisible = true
            },
            editCate() {
                this.$refs.editCateFormRef.validate(async valid => {
                    if (!valid) return
                     const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, this.editCateForm)
                     if (res.meta.status != 200) return this.$message.error('修改分类失败')
                     this.$message.success('修改分类成功')
                     this.getCateList()
                     this.editCateDialogVisible = false
                })
            },
            deleteCate(id) {
                this.$confirm('此操作将永久删除该分类，是否继续？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async() => {
                    const { data: res } = await this.$http.delete('categories/' + id)
                    if (res.meta.status != 200) return this.$message.error('删除分类失败')
                    this.$message.success('删除分类成功')
                    this.getCateList()
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            }
        }
    }
</script>

<style lang='less' scoped>
    .treetable {
        margin-top: 15px;
    }

    .el-cascader {
        width: 100%;
    }
</style>