<template>
  <div class="product-sale">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition
]);

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
});

const chartContainer = ref(null); // 用 ref 获取 DOM
let chartInstance = null;

const initChart = () => {
  if (!chartContainer.value) {
    console.error('图表容器未找到');
    return;
  }

  // 销毁旧图表
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }

  // 初始化新图表
  chartInstance = echarts.init(chartContainer.value);
  console.log('初始化图表，categoryData:', props.categoryData);

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
        type: 'cross',
        crossStyle: {
          width: 1,
          type: 'dashed'
        },
        label: {
          show: true,
          backgroundColor: '#fff',
          borderColor: 'black',
          borderWidth: 1,
          padding: [5, 10],
          textStyle: {
            color: '#333',
            fontSize: 14,
            fontWeight: 'bold'
          }
        }
      },
      formatter: (params) => {
        const date = params[0].name;
        let tooltipContent = `${date}<br/>`;
        params.forEach((param) => {
          const productName = param.seriesName;
          const value = param.value;
          const product = props.categoryData.products.find((p) => p.productName === productName);
          const unitName = product ? product.unitName : '件';
          tooltipContent += `<div style="margin-top: 5px">${param.marker} ${productName}: <span style="font-weight: 550; color: #00cc00;">${value}</span> ${unitName}</div>`;
        });
        return tooltipContent;
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
      data: props.dates.map((date) => date.slice(5)) // 转换为 MM-DD 格式
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => `${value}`
      }
    },
    series: props.categoryData.products.map((product) => ({
      name: product.productName,
      type: 'line',
      smooth: true,
      data: product.saleDateList
    }))
  };

  chartInstance.setOption(option);
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 监听 categoryData 变化，重新初始化图表
watch(() => props.categoryData, () => {
  initChart();
}, { immediate: true });
</script>

<style scoped>
.product-sale {
  background: #fff;
  position: relative;
  height: 100%;
}

.chart-container {
  width: 100%;
  min-height: 550px;
}
</style>