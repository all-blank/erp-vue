<template>
  <div class="box sale-order-stats bgc1">
    <div class="header">
      <div class="title">
        销售订单统计<span class="sub-title">{{ start }} ~ {{ end }}</span>
      </div>
    </div>
    <div class="body" v-loading="loading">
      <div class="stats">
        <div class="item">
          <div class="num color1 text-shadow1">
            {{ saleOrderStats.saleOrderTotalCount || 0 }}
          </div>
          <div class="text color2">销售订单数</div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="num color1 text-shadow1">
            {{ saleOrderStats.noApprovalSaleOrderCount || 0 }}
          </div>
          <div class="text color2">未审批销售订单数</div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="num color1 text-shadow1">
            {{ saleOrderStats.saleOutOrderCount || 0 }}
          </div>
          <div class="text color2">出库订单数</div>
        </div>
      </div>
      <div class="stats">
        <div class="item">
          <div class="num color1 text-shadow1">
            {{ saleOrderStats.saleReturnOrderCount || 0 }}
          </div>
          <div class="text color2">退货订单数</div>
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
const saleOrderStats = ref({}); // 销售订单统计数据
const loading = ref(false); // 加载状态

// 日期处理（最近7天）
const start = ref(dayjs().subtract(2, 'day').startOf('day').format('YYYY.MM.DD')); // 7天前
const end = ref(dayjs().endOf('day').format('YYYY.MM.DD')); // 今天 23:59:59，但展示为 YYYY.MM.DD

// 获取销售订单统计数据
const fetchSaleOrderStats = async () => {
  try {
    loading.value = true;
    const params = {
      startTime: dayjs(start.value, 'YYYY.MM.DD').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(end.value, 'YYYY.MM.DD').endOf('day').format('YYYY-MM-DD HH:mm:ss') // 今天 23:59:59
    };
    const response = await AnalysisSaleApi.getSaleOrderStatus(params);
    // saleOrderStats.value = response || {};
    saleOrderStats.value = {
		"startTime": "",
		"endTime": "",
		"saleOrderTotalCount": 14,
		"noApprovalSaleOrderCount": 2,
		"saleOutOrderCount": 10,
		"saleReturnOrderCount": 2 
	 };
  } catch (error) {
    console.error('获取销售订单统计失败:', error);
    saleOrderStats.value = {};
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(async () => {
  await fetchSaleOrderStats();
});
</script>

<style lang="scss" scoped>
.sale-order-stats {
  display: flex;
  flex-direction: column;
  height: calc((100vh - 120px) * 0.2);
  min-height: 166px;
  background: #E9F3FF;
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

.bgc1 {
  background: #E9F3FF;
  background-image: url('@/assets/imgs/circle.png'), url('@/assets/imgs/task.png');
  background-repeat: no-repeat, no-repeat;
  background-position: 0 0, calc(100% - 12px) 100%;
}
</style>