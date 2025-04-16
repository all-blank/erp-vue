<template>
  <div class="dashboard">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载产品库存数据中...</div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">数据加载失败: {{ error }}</div>

    <div v-if="!loading && !error">
      <div class="header">
        <h1>产品库存预警监控</h1>
        <div class="legend">
          <div class="legend-item">
            <span class="dot warning"></span>
            <span>需补货（库存 &lt; 1000）</span>
          </div>
          <div class="legend-item">
            <span class="dot normal"></span>
            <span>库存正常</span>
          </div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="chart-item">
          <ProductStockChart :productStock="productStock" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import ProductStockChart from './components/product-stock.vue'
import { AnalysisProductApi, Product } from '@/api/erp/analysis/product'

// 仓库数据
const productStock = ref<Product[]>([])
// 加载状态
const loading = ref(false)
// 错误信息
const error = ref(null)

// 获取仓库数据
const fetchWarehouseData = async () => {
  try {
    loading.value = true
    error.value = null

    // 调用API接口
    const response = await AnalysisProductApi.getProductStock()
    // 检查响应有效性（根据实际接口结构调整）
    if (!response || !Array.isArray(response)) {
      throw new Error('无效的接口响应结构')
    }

    productStock.value = response
  } catch (err) {
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  fetchWarehouseData()
})
</script>

<style scoped>
/* 新增样式 */
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
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.warning {
  background-color: #ff6b6b;
}

.normal {
  background-color: #a5d8ff;
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
