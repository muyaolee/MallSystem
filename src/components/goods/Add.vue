<template>
    <div>
        <!-- 面包屑导航 S -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 面包屑导航 E -->
        <!-- 卡片视图区域 S -->
        <el-card>
            <!-- 提示信息 S -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
            <!-- 提示信息 E -->
            <!-- 含状态的步骤条 S -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 含状态的步骤条 E -->
            <!-- tabs标签页区域 S -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
                <el-tabs
                    v-model="activeIndex"
                    tab-position="left"
                    :before-leave="beforeTabLeave"
                    @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                v-model="addForm.goods_cat"
                                :options="cateList"
                                :props="cateProps"
                                @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item v-for="item in manyTableDate" :key="item.attr_id" :label="item.attr_name">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox
                                    v-for="(checkItem, index) in item.attr_vals"
                                    :key="index"
                                    :label="checkItem"
                                    border>
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item v-for="item in onlyTableDate" :key="item.attr_id" :label="item.attr_name">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                            :action="uploadURL"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            list-type="picture"
                            :headers="headersObj"
                            :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button class="btnAdd" type="primary" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
            <!-- tabs标签页区域 E -->
        </el-card>
        <!-- 卡片视图区域 E -->
        <!-- 图片预览对话框 S -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewDialogVisible"
            width="50%">
            <img :src="previewSrc" style="width: 100%;">
        </el-dialog>
        <!-- 图片预览对话框 E -->
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    created() {
        this.getCateList()
    },
    data() {
        return {
            activeIndex: '0',
            // 添加商品的表单数据对象
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                // 商品所属的分类数组
                goods_cat: [],
                pics: [],
                goods_introduce: '',
                attrs: []
            },
            addFormRules: {
                goods_name: [{required: true, message: '请输入商品名称', trigger: 'blur'}],
                goods_price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
                goods_weight: [{required: true, message: '请输入商品重量', trigger: 'blur'}],
                goods_number: [{required: true, message: '请输入商品数量', trigger: 'blur'}],
                goods_cat: [{required: true, message: '请选择商品分类', trigger: 'blur'}]
            },
            // 商品分类列表
            cateList: [],
            cateProps: {
                expandTrigger: 'hover',
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            manyTableDate: [],
            onlyTableDate: [],
            // 上传图片的URL地址
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            headersObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            previewDialogVisible: false,
            previewSrc: ''
        }
    },
    methods: {
        // 获取所有商品分类数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories')
            if (res.meta.status != 200) return this.$message.error('请求商品分类列表失败')
            this.cateList = res.data    
        },
        // 级联选择器选中项发生变化会触发这个函数
        handleChange() {
            if (this.addForm.goods_cat.length != 3) {
                this.addForm.goods_cat = []
                return
            }
        },
        beforeTabLeave() {
            if (this.activeIndex == '0' && this.addForm.goods_cat.length != 3) {
                this.$message.error('请选择商品分类')
                return false
            }
        },
        async tabClicked() {
            if (this.activeIndex == '1') {
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'many'}})
                if (res.meta.status != 200) return this.$message.error('获取商品参数失败')
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                })
                this.manyTableDate = res.data
            } else if (this.activeIndex == '2') {
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'only'}})
                if (res.meta.status != 200) return this.$message.error('获取商品参数失败')
                this.onlyTableDate = res.data
            }
        },
        handlePreview(file) {
            this.previewDialogVisible = true
            this.previewSrc = file.response.data.url
        },
        handleRemove(file) {
            var tmp_path = file.response.data.tmp_path
            for (var i = 0; i < this.addForm.pics.length; i++) {
                if (this.addForm.pics[i].pic == tmp_path){
                    this.addForm.pics.splice(i, 1)
                    break
                }
            }
        },
        handleSuccess(response) {
            var picInfo = { pic: response.data.tmp_path }
            this.addForm.pics.push(picInfo)
        },
        add () {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return this.$message.error('请填写必要的表单项')
                
                // 深拷贝
                const newAddform = _.cloneDeep(this.addForm)
                newAddform.goods_cat = newAddform.goods_cat.join(',')
                
                // 处理动态参数
                this.manyTableDate.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(',')
                    }
                    this.addForm.attrs.push(newInfo)
                })
                
                 // 处理静态属性
                this.onlyTableDate.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    this.addForm.attrs.push(newInfo)
                })

                newAddform.attrs = this.addForm.attrs
                
                // 发起请求添加商品，商品的名称必须是唯一的
                const {data: res} = await this.$http.post('goods', newAddform)
                if (res.meta.status != 201) return this.$message.error('添加商品失败')
                this.$message.success('添加商品成功')
                this.$router.push('/goods')
            })
        }
    },
    computed: {
        cateId() {
            return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
        }
    }
}
</script>

<style lang='less' scoped>
    .btnAdd {
        margin-top: 15px;
    }
</style>