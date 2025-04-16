<template>
  <div class="dashboard">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载产品销售数据中...</div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">数据加载失败: {{ error }}</div>

    <div v-if="!loading && !error">
      <div class="header">
        <h1>各分类下最近30天产品销量占比</h1>
        <div class="legend">
          <div class="legend-item">
            <span class="calendar-icon">📅</span>
            {{ dateRange.startDate }} 至 {{ dateRange.endDate }}
          </div>
        </div>
      </div>

      <div class="chart-grid">
        <div v-for="category in categoryData" :key="category.categoryId" class="chart-item">
          <SaleProportionPie :category-data="category" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SaleProportionPie from './components/product-sale-proportion.vue';
import { AnalysisProductApi } from '@/api/erp/analysis/product';

// 定义响应式变量
const categoryData = ref([]);
const loading = ref(false);
const error = ref(null);
const dateRange = ref({ startDate: '', endDate: '' }); // 存储日期范围

// 计算最近30天的开始时间和结束时间
const getDateRange = () => {
  const today = new Date();
  
  // 结束时间：昨天的 23:59:59
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1); // 昨天
  endDate.setHours(23, 59, 59, 999); // 23:59:59.999
  const endTime = endDate.toISOString().replace('T', ' ').slice(0, 19); // 格式如 "2025-04-10 23:59:59"
  const endDateStr = endDate.toISOString().slice(0, 10); // 格式如 "2025-04-10"

  // 开始时间：30天前的 00:00:00
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30); // 30天前
  startDate.setHours(0, 0, 0, 0); // 00:00:00
  const startTime = startDate.toISOString().replace('T', ' ').slice(0, 19); // 格式如 "2025-03-12 00:00:00"
  const startDateStr = startDate.toISOString().slice(0, 10); // 格式如 "2025-03-12"

  // 存储日期范围
  dateRange.value = {
    startDate: startDateStr,
    endDate: endDateStr
  };

  return { startTime, endTime };
};

// 获取最近30天的销售数据
const fetchSaleData = async () => {
  const { startTime, endTime } = getDateRange();
  const params = { startTime, endTime };
  const response = await AnalysisProductApi.getProductSaleCountBasedCategory(params);
  return response.saleData; // 返回分类数组
};

// 组件挂载时获取数据
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;

    // 获取最近30天的销售数据
    const saleData = await fetchSaleData();

    // 赋值给 categoryData
    categoryData.value = saleData;
  } catch (err) {
    error.value = err.message || '未知错误';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

.error {
  padding: 20px;
  color: #ff4444;
  background: #fff0f0;
  border-radius: 4px;
  margin: 20px;
}

.dashboard {
  padding: 20px;
  min-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 20px;
}

h1 {
  font-size: 20px;
  color: #303133;
  margin: 0;
}

.legend {
  display: flex;
  align-items: center;
}

.legend-item {
  font-size: 14px;
  color: red;
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 12px;
  margin-left: 16px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-item {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  transition: transform 0.2s;
  min-height: 300px;
}

.chart-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .legend {
    margin-top: 8px;
  }

  .legend-item {
    margin-left: 0;
  }
}
</style>