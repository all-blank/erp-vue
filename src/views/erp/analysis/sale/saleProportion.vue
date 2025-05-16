<template>
  <div class="dashboard">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载产品销售数据中...</div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">数据加载失败: {{ error }}</div>

    <div v-if="!loading && !error">
      <div class="header">
        <div class="title-group">
          <h1>各分类下最近30天产品销量占比</h1>
          <div class="legend">
            <div class="legend-item">
              <span class="calendar-icon">📅</span>
              {{ dateRange.startDate }} 至 {{ dateRange.endDate }}
            </div>
          </div>
        </div>
        <el-select v-model="selectedCategoryId" placeholder="请选择分类" @change="handleCategoryChange" style="width: 200px;">
          <el-option
            v-for="category in categoryData"
            :key="category.categoryId"
            :label="category.categoryName"
            :value="category.categoryId"
          />
        </el-select>
      </div>

      <div class="chart-grid">
        <div v-if="selectedCategory" class="chart-item">
          <SaleProportionPie :category-data="selectedCategory" :dates="dates" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import SaleProportionPie from './components/product-sale-proportion.vue';
import { AnalysisProductApi } from '@/api/erp/analysis/product';

// 定义响应式变量
const categoryData = ref([]);
const selectedCategoryId = ref<number | null>(null);
const loading = ref(false);
const error = ref(null);
const dateRange = ref({ startDate: '', endDate: '' });
const dates = ref<string[]>([]);

// 计算最近30天的开始时间和结束时间
const getDateRange = () => {
  const today = new Date();
  console.log('计算日期范围，today:', today);

  // 结束时间：昨天的 23:59:59
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1);
  endDate.setHours(23, 59, 59, 999);
  const endDateStr = endDate.toISOString().split('T')[0];
  console.log('endDate:', endDateStr);

  // 开始时间：30天前的 00:00:00
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30);
  startDate.setHours(0, 0, 0, 0);
  const startDateStr = startDate.toISOString().split('T')[0];
  console.log('startDate:', startDateStr);

  // 生成日期列表
  const dateList = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dateList.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  dates.value = dateList;
  console.log('生成的日期列表:', dates.value);

  // 存储日期范围
  dateRange.value = {
    startDate: startDateStr,
    endDate: endDateStr
  };

  return { startTime: `${startDateStr} 00:00:00`, endTime: `${endDateStr} 23:59:59` };
};

// 获取最近30天的销售数据
const fetchSaleData = async () => {
  const { startTime, endTime } = getDateRange();
  const params = { startTime, endTime };
  console.log('请求参数:', params);
  const response = await AnalysisProductApi.getProductSaleCountBasedCategory(params);
  return response.saleData || [];
};

// 获取选中的分类
const selectedCategory = computed(() => {
  return categoryData.value.find(c => c.categoryId === selectedCategoryId.value);
});

// 组件挂载时获取数据
onMounted(async () => {
  try {
    loading.value = true;
    error.value = null;

    // 获取最近30天的销售数据
    const saleData = await fetchSaleData();
    categoryData.value = saleData;
    if (categoryData.value.length > 0) {
      selectedCategoryId.value = categoryData.value[0].categoryId;
    }
    console.log('加载的分类数据:', categoryData.value);
  } catch (err) {
    error.value = err.message || '未知错误';
    console.error('数据加载错误:', err);
  } finally {
    loading.value = false;
  }
});

// 处理分类选择变化
const handleCategoryChange = (categoryId: number) => {
  selectedCategoryId.value = categoryId;
  console.log('选中的分类ID:', categoryId);
};
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

.title-group {
  display: flex;
  align-items: center;
  gap: 8px; /* 控制 h1 和 legend 之间的间距 */
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
}

.chart-item {
  width: 80%; /* 缩小图表宽度 */
  margin: 0 auto; /* 水平居中 */
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  transition: transform 0.2s;
  min-height: 400px;
}

.chart-grid {
  display: flex;
  justify-content: center; /* 居中显示图表容器 */
  align-items: center;
  gap: 20px;
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

  .title-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .legend-item {
    margin-left: 0;
  }
}
</style>