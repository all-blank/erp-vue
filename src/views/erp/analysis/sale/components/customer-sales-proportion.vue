<template>
  <div
    id="chartTop"
    ref="EcharRef"
    class="monitorContainer"
  ></div>
</template>

<script setup>
import * as echarts from 'echarts';
import { onMounted, ref } from 'vue';

const EcharRef = ref(null);

// 获取父组件数据
const props = defineProps({
  chartOption: {
    type: Object,
    default: () => ({}),
  },
});

onMounted(() => {
  const chartDom = EcharRef.value;
  if (chartDom) {
    const myChart = echarts.init(chartDom);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br />总占比：{d}%',
        backgroundColor: '#FFFFFF',
        borderColor: '#eef3f8',
        borderWidth: 1,
        textStyle: {
          color: '#8C8C8C',
        },
        padding: 12,
      },
      label: {
        formatter: ['{name|{b}}', '{percentage|{d}%}'].join('\n'),
        rich: {
          name: {
            color: '#333333',
            fontWeight: 'bolder',
            align: 'left',
          },
          percentage: {
            color: '#000000',
            lineHeight: 15,
            align: 'left',
          },
        },
      },
      labelLine: {
        lineStyle: {
          color: '#BFBFBF',
        },
      },
      series: [
        {
          type: 'pie',
          roseType: 'radius',
          radius: [33, 100],
          center: ['50%', '50%'],
          data: props.chartOption.seriesData,
          animationEasing: 'cubicInOut',
          animationDuration: 2600,
        },
      ],
      color: ['#85A7FF', '#99EBBD', '#FFB18B', '#C6EBFF', '#BECCE6'],
    };
    myChart.setOption(option);
  } else {
    console.error('图表容器未找到');
  }
});
</script>