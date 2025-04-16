<template>
  <div class="box sale-stats bgc2">
    <div class="header">
      <div class="title">
        销售统计<span class="sub-title">{{ start }} ~ {{ end }}</span>
      </div>
    </div>
    <div class="body" v-loading="loading">
      <div class="stats">
        <div class="item">
          <div class="num color5 text-shadow2">
            {{ totalSaleCount > 10000 ? (totalSaleCount / 10000).toFixed(2) : totalSaleCount }}
            <span class="trend" :class="saleCountTrend.class">
              {{ saleCountTrend.text }}
            </span>
          </div>
          <div class="text color4"> 销售量{{ totalSaleCount > 10000 ? '(万)' : '' }} </div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="num color5 text-shadow2">
            {{ totalSales > 10000 ? (totalSales / 10000).toFixed(2) : totalSales }}
            <span class="trend" :class="salesTrend.class">
              {{ salesTrend.text }}
            </span>
          </div>
          <div class="text color4"> 销售额（{{ totalSales > 10000 ? '万元' : '元' }}） </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { AnalysisSaleApi } from '@/api/erp/analysis/sale'; // 假设接口路径

// 定义变量
const totalSaleCount = ref(0); // 最近 7 天的销售量
const totalSales = ref(0); // 最近 7 天的销售额
const prevTotalSaleCount = ref(0); // 前 7 天前的 7 天销售量
const prevTotalSales = ref(0); // 前 7 天前的 7 天销售额
const loading = ref(false); // 加载状态

// 趋势数据（箭头和百分比）
const saleCountTrend = ref({ class: '', text: '' });
const salesTrend = ref({ class: '', text: '' });

// 日期处理（最近 7 天）
const start = ref(dayjs().subtract(6, 'day').startOf('day').format('YYYY.MM.DD')); // 7 天前
const end = ref(dayjs().endOf('day').format('YYYY.MM.DD')); // 今天 23:59:59

// 计算前 7 天前的 7 天时间范围（第 14 天到第 8 天）
const getPreviousWeekRange = () => {
  const prevStart = dayjs().subtract(13, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'); // 第 14 天
  const prevEnd = dayjs().subtract(7, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss'); // 第 8 天
  return { prevStart, prevEnd };
};

// 获取最近 7 天的销售数据
const fetchSaleInfo = async () => {
  try {
    const params = {
      startTime: dayjs(start.value, 'YYYY.MM.DD').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(end.value, 'YYYY.MM.DD').endOf('day').format('YYYY-MM-DD HH:mm:ss')
    };
    const response = await AnalysisSaleApi.getSaleInfo(params);
    totalSaleCount.value = response.totalSaleCount || 0;
    totalSales.value = response.totalSales || 0;
  } catch (error) {
    console.error('获取销售数据失败:', error);
    totalSaleCount.value = 0;
    totalSales.value = 0;
  }
};

// 获取前 7 天前的 7 天销售数据
const fetchPreviousWeekStats = async () => {
  try {
    const { prevStart, prevEnd } = getPreviousWeekRange();
    const params = {
      startTime: prevStart,
      endTime: prevEnd
    };
    const response = await AnalysisSaleApi.getSaleInfo(params);
    prevTotalSaleCount.value = response.totalSaleCount || 0;
    prevTotalSales.value = response.totalSales || 0;
  } catch (error) {
    console.error('获取前 7 天销售数据失败:', error);
    prevTotalSaleCount.value = 0;
    prevTotalSales.value = 0;
  }
};

// 计算趋势（箭头和百分比）
const calculateTrend = (current, previous) => {
  if (previous === 0) {
    return { class: 'trend-up', text: '+100%' }; // 如果之前为 0，增长 100%
  }
  const change = ((current - previous) / previous) * 100;
  const changeText = change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  const changeClass = change >= 0 ? 'trend-up' : 'trend-down';
  return { class: changeClass, text: changeText };
};

// 获取数据并计算趋势
onMounted(async () => {
  try {
    loading.value = true;
    // 获取最近 7 天的数据
    await fetchSaleInfo();
    // 获取前 7 天的数据
    await fetchPreviousWeekStats();
    // 计算销售量趋势
    saleCountTrend.value = calculateTrend(totalSaleCount.value, prevTotalSaleCount.value);
    // 计算销售额趋势
    salesTrend.value = calculateTrend(totalSales.value, prevTotalSales.value);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.sale-stats {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.2);
  min-height: 166px;
  background: #e9f3ff;
  border-radius: 20px;

  .body {
    flex: 1;
    display: flex;

    .stats {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      .item {
        display: inline-flex;
        flex-direction: column;

        .num {
          height: 50px;
          font-size: 36px;
          font-family: PingFangSC-Semibold, PingFang SC;
          font-weight: 600;
          line-height: 50px;
          text-shadow: 2px 4px 7px rgba(85, 132, 255, 0.5);
          display: flex;
          align-items: center;
        }

        .trend {
          margin-left: 8px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          animation: fadeIn 0.5s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .trend-up {
          color: #91cc75; /* 绿色，与上升箭头一致 */
        }

        .trend-up::before {
          content: '↑';
          color: #91cc75; /* 绿色上升箭头 */
          margin-right: 4px;
        }

        .trend-down {
          color: #4682B4; /* 红色，与下降箭头一致 */
        }

        .trend-down::before {
          content: '↓';
          color: #4682B4; /* 红色下降箭头 */
          margin-right: 4px;
        }

        .text {
          height: 17px;
          margin-top: 3px;
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #91a7dc;
          line-height: 17px;
        }

        .color1 {
          color: #072074;
        }

        .color2 {
          color: #91a7dc;
        }

        .color3 {
          color: #ff5757;
        }

        .color4 {
          color: #de9690;
        }

        .color5 {
          color: #FF5722;
        }

        .text-shadow1 {
          text-shadow: 2px 4px 7px rgba(85, 132, 255, 0.5);
        }

        .text-shadow2 {
          text-shadow: 2px 4px 7px rgba(255, 99, 85, 0.5);
        }
      }
    }
  }
}

.bgc2 {
  background: #fbefe8 url('@/assets/imgs/sale.png') no-repeat calc(100% - 12px) 100%;
}
</style>