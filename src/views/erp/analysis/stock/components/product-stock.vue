<template>
  <div class="product-stock">
    <div ref="chartContainer" class="chart-container"></div>
    <div class="summary-info">
      <div class="warning-count">
        <span class="dot" :style="{ backgroundColor: warningColor }"></span>
        需补货商品：{{ lowStockCount }} 个
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  productStock: {
    type: Object,
    required: true
  }
})

const WARNING_THRESHOLD = 1000
const chartContainer = ref(null)
let chartInstance = null
const warningColor = '#ff6b6b'

// 计算低库存数量
const lowStockCount = computed(
  () => props.productStock.filter((p) => p.stockCount < WARNING_THRESHOLD).length
)

// 生成图表数据
const chartData = computed(() => {
  const rawProducts = JSON.parse(JSON.stringify(props.productStock))

  return {
    yAxisData: rawProducts.map((p) => p.productName),
    seriesData: rawProducts.map((p) => ({
      name: p.productName,
      value: p.stockCount,
      unit: p.unit || '件',
      itemStyle: {
        color: p.stockCount < WARNING_THRESHOLD ? warningColor : '#a5d8ff'
      }
    }))
  }
})

const initChart = () => {
  if (!chartContainer.value) return

  chartInstance = echarts.init(chartContainer.value)

  const option = {
    title: {
      text: "各产品库存",
      left: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross', // 使用十字准星指示器
        crossStyle: {
          color: '#8A2BE2', // 十字线颜色
          width: 1, // 十字线宽度
          type: 'dashed' // 十字线样式，实线
        },
        label: {
          show: true, // 显示坐标轴标签
          backgroundColor: '#fff', // 标签背景色
          borderColor: '#8A2BE2', // 标签边框颜色
          borderWidth: 1, // 标签边框宽度
          padding: [5, 10], // 标签内边距
          textStyle: {
            color: '#333', // 标签文字颜色
            fontSize: 14, // 标签文字大小
            fontWeight: 'bold' // 标签文字加粗
          }
        }
      },
      formatter: (params) => {
        const data = params[0].data
        return `
                    <div style="text-align: left; padding: 8px">
                        <div><span style="font-weight: 550;">商品：</span>${data.name}</div>
                        <div><span style="font-weight: 550;">库存：</span><b>${data.value}</b> ${data.unitName}</div>
                        <div><span style="font-weight: 550;">状态：</span>${
                          data.value < WARNING_THRESHOLD
                            ? '<span style="color:#ff6b6b;">需补货</span>'
                            : '<span style="color:#67C23A;">库存充足</span>'
                        }
                        </div>
                    </div>
                `
      }
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} '
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      axisTick: { show: false },
      data: chartData.value.yAxisData,
      axisLabel: {
        fontSize: 14,
        color: '#606266',
        fontWeight: 550
      }
    },
    series: [
      {
        type: 'bar',
        data: chartData.value.seriesData,
        barWidth: '65%',
        label: {
          show: true,
          position: 'right',
          formatter: ({ value }) => (value < WARNING_THRESHOLD ? '需补货' : ''),
          color: warningColor,
          fontWeight: 'bold'
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#fff',
          borderRadius: [0, 5, 5, 0]
        }
      }
    ],
    grid: {
      left: '5%',
      right: '15%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    // 新增 dataZoom 配置
    dataZoom: [
      {
        type: 'slider', // 使用 slider 类型，显示滚动条
        orient: 'vertical',
        show: props.productStock.length > 10, // 产品数大于12时显示
        yAxisIndex: 0, // 绑定到 Y 轴
        width: 5, // 滚动条宽度
        right: 50, // 距离右边缘10像素
        height: '70%', // 高度占图表高度的70%
        handleSize: '80%', // 滚动条手柄大小
        zoomLock: true, // 禁止缩放，仅允许滚动
        start: 0, // 起始位置为0%
        end:
          props.productStock.length > 10 ? (10 / props.productStock.length) * 100 : 100, // 若超过8个产品，显示前8个，否则显示全部

        // 自定义样式
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // 滚动条背景色
        borderColor: '#ccc', // 边框颜色
        fillerColor: 'rgba(0, 150, 136, 0.5)', // 填充颜色
        handleStyle: {
          color: '#009688', // 手柄颜色
          borderColor: '#fff', // 手柄边框颜色
          borderWidth: 1, // 手柄边框宽度
          shadowColor: 'rgba(0, 150, 136, 0.5)', // 添加阴影效果，避免首尾悬浮
          shadowBlur: 10 // 附加阴影效果来增加视觉对比度
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

const updateChart = () => {
  if (!chartInstance) return

  const dataZoomOption = {
    show: props.productStock.length > 10,
    start: 0,
    end: props.productStock.length > 10 ? (10 / props.productStock.length) * 100 : 100
  }

  chartInstance.setOption({
    yAxis: { data: chartData.value.yAxisData },
    series: [{ data: chartData.value.seriesData }],
    dataZoom: [dataZoomOption]
  })
}

// 监听数据变化
watch(chartData, () => {
  updateChart()
  handleResize()
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

const handleResize = () => chartInstance?.resize()
</script>

<style scoped>
.product-stock {
  background: #fff;
  position: relative;
  height: 100%;
}

.chart-container {
  width: 100%;
  min-height: 700px; /* 新增最小高度 */
}

.summary-info {
  position: absolute;
  bottom: 10px;
  left: 20px;
  font-size: 12px;
  color: #606266;
}

.warning-count {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
