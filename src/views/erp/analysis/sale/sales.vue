<template>
  <div class="dashboard">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载产品销售数据中...</div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">数据加载失败: {{ error }}</div>

    <div v-if="!loading && !error">
      <div class="header">
        <h1>各分类下产品销量</h1>
      </div>

      <div class="chart-grid">
        <div v-for="category in categoryData" :key="category.categoryId" class="chart-item">
          <category-line-chart :category-data="category" :dates="dates" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CategoryLineChart from './components/product-sale-by-category.vue'
import { AnalysisProductApi } from '@/api/erp/analysis/product'

// 定义响应式变量
const dates = ref([]) // 最近7天的日期列表，响应式
const saleDataByDate = ref({})
const categoryData = ref([])
const loading = ref(false)
const error = ref(null)

// 生成最近7天的日期列表并赋值给 dates
const generateDates = () => {
  const datesArray = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    datesArray.push(date.toISOString().slice(0, 10)) // 格式如 "2023-10-01"
  }
  return datesArray
}

// 获取某一天的销售数据
const fetchSaleDataForDate = async (date) => {
  const startTime = `${date} 00:00:00`
  const endTime = `${date} 23:59:59`
  const params = { startTime, endTime }
  const response = await AnalysisProductApi.getProductSaleCountBasedCategory(params)
  return response.saleData // 假设返回的是分类数组
}

// 处理分类和产品数据
const processCategoryData = () => {
  const categoryMap = {}

  dates.value.forEach((date, index) => {
    const dayData = saleDataByDate.value[date] || []
    dayData.forEach((category) => {
      const { categoryId, categoryName, products } = category

      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          categoryId,
          categoryName,
          products: {}
        }
      }

      products.forEach((product) => {
        const { productId, productName, saleCount, unitName } = product
        if (!categoryMap[categoryId].products[productId]) {
          categoryMap[categoryId].products[productId] = {
            productId,
            productName,
            unitName,
            saleDateList: Array(7).fill(0)
          }
        }
        categoryMap[categoryId].products[productId].saleDateList[index] = saleCount
      })
    })
  })

  categoryData.value = Object.values(categoryMap).map((category) => ({
    ...category,
    products: Object.values(category.products)
  }))
}

// 组件挂载时获取数据
onMounted(async () => {
  try {
    loading.value = true
    error.value = null

    // 生成最近7天的日期并赋值给响应式变量
    dates.value = generateDates()

    // 获取每一天的销售数据
    for (const date of dates.value) {
      saleDataByDate.value[date] = await fetchSaleDataForDate(date) 
    }
    // 处理分类数据
    processCategoryData()
  } catch (err) {
    error.value = err.message || '未知错误'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 原有样式保持不变 */
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

.chart-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.chart-item {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  transition: transform 0.2s;
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
}
</style>