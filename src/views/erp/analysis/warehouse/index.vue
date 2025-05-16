<template>
  <div class="dashboard">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">加载仓库数据中...</div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">数据加载失败: {{ error }}</div>

    <div v-if="!loading && !error">
      <div class="header">
        <h1>仓库库存</h1>
        <el-select v-model="selectedWarehouseId" placeholder="请选择仓库" @change="handleWarehouseChange" style="width: 200px;">
          <el-option
            v-for="warehouse in warehouses"
            :key="warehouse.warehouseId"
            :label="warehouse.warehouseName"
            :value="warehouse.warehouseId"
          />
        </el-select>
      </div>

      <div class="chart-grid">
        <div v-if="selectedWarehouse" class="chart-item">
          <WarehouseStockChart :warehouse="selectedWarehouse" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import WarehouseStockChart from './components/warehouse-stock.vue'
import { AnalysisWarehouseApi, ErpAnalysisWarehouseStockRespVO } from '@/api/erp/analysis/warehouse'

// 仓库数据
const warehouses = ref<ErpAnalysisWarehouseStockRespVO[]>([])
// 选中的仓库 ID
const selectedWarehouseId = ref<number | null>(null)
// 加载状态
const loading = ref(false)
// 错误信息
const error = ref(null)

// 获取选中的仓库
const selectedWarehouse = computed(() => {
  return warehouses.value.find(w => w.warehouseId === selectedWarehouseId.value)
})

// 获取仓库数据
const fetchWarehouseData = async () => {
  try {
    loading.value = true
    error.value = null

    // 调用API接口
    const response = await AnalysisWarehouseApi.getWarehouseStock()
    // 检查响应有效性
    if (!response || !Array.isArray(response)) {
      throw new Error('无效的接口响应结构')
    }

    warehouses.value = response
    // 默认选中第一个仓库
    if (warehouses.value.length > 0) {
      selectedWarehouseId.value = warehouses.value[0].warehouseId
    }
  } catch (err) {
    error.value = err.message || '未知错误'
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  fetchWarehouseData()
})

// 处理仓库选择变化
const handleWarehouseChange = (warehouseId: number) => {
  selectedWarehouseId.value = warehouseId
}
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