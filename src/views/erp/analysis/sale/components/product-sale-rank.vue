<template>
  <div class="box bgc3 product-sale-rank">
    <div class="header">
      <div class="title1">
        产品销售额榜单
      </div>
      <!-- 添加右上角切换组件 -->
      <div class="date-range-selector">
        <el-select v-model="dateRange" placeholder="请选择日期范围" @change="handleDateRangeChange">
          <el-option label="最近7天" :value="7" />
          <el-option label="最近15天" :value="15" />
          <el-option label="最近30天" :value="30" />
        </el-select>
      </div>
    </div>
    <div class="body" v-loading="loading">
      <el-row v-for="(item, index) in productSaleRank" :key="index">
        <el-col :span="3">
          <div :class="'top top' + (index + 1)">
            {{ index + 1 }}
          </div>
        </el-col>
        <el-col :span="13">
          <div class="product-name" :title="item.productName">
            {{ item.productName }}
          </div>
        </el-col>
        <el-col :span="6">
          <div class="count">
            {{ formatSales(item.totalSales) }} 
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { AnalysisProductApi } from '@/api/erp/analysis/product'; // 假设接口路径

// 定义变量
const productSaleRank = ref([]); // 产品销售额排行榜数据
const categoryName = ref(''); // 分类名称（可选）
const dateRange = ref(7); // 默认选择最近7天
const loading = ref(false); // 加载状态

// 初始化结束时间为昨天的最后时间
const end = ref(dayjs().subtract(1, 'day').endOf('day').format('YYYY.MM.DD')); // 昨天 23:59:59
const start = ref(dayjs().subtract(7, 'day').startOf('day').format('YYYY.MM.DD')); // 默认从 7 天前开始

// 格式化销售额显示
const formatSales = (totalSales) => {
  if (totalSales > 10000) {
    return (totalSales / 10000).toFixed(2) + ' 万元'; // 大于1000以万为单位，保留2位小数
  }
  return totalSales + " 元"; // 小于等于1000直接显示
};

// 更新日期范围并重新获取数据
const handleDateRangeChange = async () => {
  // 结束时间始终是昨天的最后时间
  const endDate = dayjs().subtract(1, 'day').endOf('day');
  end.value = endDate.format('YYYY.MM.DD');

  // 根据选择的日期范围计算开始时间
  const days = dateRange.value;
  start.value = endDate.subtract(days - 1, 'day').startOf('day').format('YYYY.MM.DD');

  // 重新获取数据
  await fetchProductSales();
};

// 获取产品销售额排行榜数据
const fetchProductSales = async () => {
  try {
    loading.value = true;
    const params = {
      startTime: dayjs(start.value, 'YYYY.MM.DD').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(end.value, 'YYYY.MM.DD').endOf('day').format('YYYY-MM-DD HH:mm:ss')
    };
    const response = await AnalysisProductApi.getProductSales(params);
    productSaleRank.value = response.products || [];
    
  } catch (error) {
    console.error('获取产品销售额排行榜失败:', error);
    productSaleRank.value = [];
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(async () => {
  await handleDateRangeChange(); // 初始化时也调用，确保日期范围正确
});
</script>

<style lang="scss" scoped>
.product-sale-rank {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.6);
  min-height: 538px;
  background: #FFFFFF;
  border-radius: 20px;

  .header {
    position: relative; /* 为右上角切换组件定位 */
  }


  .date-range-selector {
    position: absolute;
    top: 0;
    right: 20px;
    .el-select {
      width: 120px;
    }
  }

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 20px;

    .top {
      display: inline-block;
      width: 16px;
      height: 20px;
      margin-left: 10px;
      background: url('@/assets/imgs/sale-rank/top.png');
      text-align: center;
      font-size: 12px;
      font-weight: normal;
      color: #E9B499;
      line-height: 14px;
    }

    .top1 {
      width: 21px;
      height: 20px;
      background: url('@/assets/imgs/sale-rank/top1.png');
      color: #8E5900;
    }

    .top2 {
      width: 21px;
      height: 20px;
      background: url('@/assets/imgs/sale-rank/top2.png');
      color: #494949;
    }

    .top3 {
      width: 21px;
      height: 20px;
      background: url('@/assets/imgs/sale-rank/top3.png');
      color: #CF6D3D;
    }

    .product-name {
      height: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #333333;
      line-height: 20px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .count {
      height: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #737589;
      line-height: 20px;
      text-align: right;
    }
  }
}
</style>