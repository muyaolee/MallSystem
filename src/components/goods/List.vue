<template>
    <div>
        <!-- 面包屑导航 S -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 面包屑导航 E -->
        <!-- 卡片视图区域 S -->
        <el-card>
            <!-- 搜索与添加区域 S -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input
                        v-model="queryInfo.query"
                        placeholder="请输入搜索内容"
                        clearable
                        @clear="getGoodsList"
                        @keyup.enter.native="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="16">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 搜索与添加区域 E -->
            <!-- 表格数据区域 S -->
            <el-table :data="goods" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格（元）" prop="goods_price" width="105px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
                <el-table-column label="创建时间" width="150px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dataFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoods(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 表格数据区域 E -->
            <!-- 分页 S -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 20, 30]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
            <!-- 分页 E -->
        </el-card>
        <!-- 卡片视图区域 E -->
    </div>
</template>

<script>
export default {
    created() {
        this.getGoodsList()
    },
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            goods: [],
            total: 0
        }
    },
    methods: {
        async getGoodsList() {
            const {data: res} = await this.$http.get('goods', {params: this.queryInfo})
            if (res.meta.status != 200) return this.$message.error('获取商品列表失败')
            this.total = res.data.total
            this.goods = res.data.goods
        },
        handleSizeChange(pagesize) {
            this.queryInfo.pagesize = pagesize
            this.getGoodsList()
        },
        handleCurrentChange(pagenum) {
            this.queryInfo.pagenum = pagenum
            this.getGoodsList()
        },
        removeGoods(id) {
            this.$confirm('此操作将永久删除该商品，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async() => {
                const {data: res} = await this.$http.delete(`goods/${id}`)
                if (res.meta.status != 200) return this.$message.error('删除商品失败')
                this.getGoodsList()
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                })
            })
        },
        goAddpage() {
            this.$router.push('/goods/add')
        }
    }
}
</script>

<style lang='less' scoped>
    
</style>