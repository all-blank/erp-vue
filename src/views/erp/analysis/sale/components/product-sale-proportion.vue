<template>
  <div class="sale-proportion-pie">
    <div :id="`pieChart-${categoryData.categoryId}`" class="chart-container"> </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// 注册 ECharts 组件
echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

// 接收父组件传递的数据
const props = defineProps({
  categoryData: {
    type: Object,
    required: true
  }
})

console.log('categoryData:', props.categoryData)

onMounted(() => {
  const chartDom = document.getElementById(`pieChart-${props.categoryData.categoryId}`)
  const myChart = echarts.init(chartDom)
  console.log('categoryData:', props.categoryData)

  // 准备饼图数据
  const pieData = props.categoryData.products.map((product) => ({
    name: product.productName,
    value: product.saleCount,
    unitName: product.unitName || '件' // 确保 unitName 有默认值
  }))

  const option = {
    title: {
      text: `${props.categoryData.categoryName}`,
      left: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: ({ data }) => {
        const { name, value, unitName } = data
        const percent = (
          (value / pieData.reduce((sum, item) => sum + item.value, 0)) *
          100
        ).toFixed(2)
        return `${name}: ${value} ${unitName} (${percent}%)`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        data: pieData,
        label: {
          fontSize: 12,
          formatter: ({ data }) => {
            const { name, value, unitName } = data
            const percent = (
              (value / pieData.reduce((sum, item) => sum + item.value, 0)) *
              100
            ).toFixed(2)
            return `{b|${name}}\n{c|${value} ${unitName}}\n{d|${percent}%}`
          },
          rich: {
            b: { fontSize: 12, fontWeight: 'bold', color: '#333' },
            c: { fontSize: 10, color: '#666' },
            d: { fontSize: 10, color: '#999' }
          }
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#fff'
        }
      }
    ]
  }

  myChart.setOption(option)

  window.addEventListener('resize', () => myChart.resize())
})


</script>

<style scoped>
.sale-proportion-pie {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-title {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 600;
  color: #333;
  z-index: 10;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
