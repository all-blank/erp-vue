<template>
  <div class="product-sale">
    <div :id="`chart-${categoryData.categoryId}`" class="chart-container"> </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import * as echarts from 'echarts/core'
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition
])

// 接收父组件传递的数据
const props = defineProps({
  categoryData: {
    type: Object,
    required: true
  },
  dates: {
    type: Array,
    required: true
  }
})

onMounted(() => {
  const chartDom = document.getElementById(`chart-${props.categoryData.categoryId}`)
  const myChart = echarts.init(chartDom)

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
      trigger: 'axis',
      axisPointer: {
        type: 'cross', // 使用十字准星指示器
        crossStyle: {
          width: 1, // 十字线宽度
          type: 'dashed' // 十字线样式，实线
        },
        label: {
          show: true, // 显示坐标轴标签
          backgroundColor: '#fff', // 标签背景色
          borderColor: 'black', // 标签边框颜色
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
        // params 是一个数组，包含所有系列在当前横轴点的数据
        const date = params[0].name // 横轴日期（MM-DD 格式）
        let tooltipContent = `${date}<br/>` // 日期作为第一行

        // 遍历每个系列（产品）
        params.forEach((param) => {
          const productName = param.seriesName // 产品名称
          const value = param.value // 销量值
          // 从 categoryData.products 中找到对应的产品和单位
          const product = props.categoryData.products.find((p) => p.productName === productName)
          const unitName = product ? product.unitName : '件' // 默认单位为 '件'
          // 拼接产品名称、销量和单位
          tooltipContent += `<div style="margin-top: 5px">${param.marker} ${productName}: &nbsp;&nbsp;<span style="font-weight: 550; color: #00cc00;">${value}</span> ${unitName}</div>`
        })

        return tooltipContent
      }
    },
    legend: {
      data: props.categoryData.products.map((p) => p.productName),
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {
          title: '保存为图片'
        }
      },
      right: 20
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.dates.map((date: string) => date.slice(5)) // 转换为 MM-DD 格式
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => `${value}` // 动态单位
      }
    },
    series: props.categoryData.products.map((product) => ({
      name: product.productName,
      type: 'line',
      smooth: true,
      data: product.saleDateList
    }))
  }

  myChart.setOption(option)

  // 窗口大小改变时自适应
  window.addEventListener('resize', () => myChart.resize())
})
</script>

<style scoped>
.product-sale {
  background: #fff;
  position: relative;
  height: 100%;
}

.chart-container {
  width: 100%;
  min-height: 550px; /* 新增最小高度 */
}
</style>
