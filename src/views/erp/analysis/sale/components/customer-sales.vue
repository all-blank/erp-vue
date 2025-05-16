<template>
  <div class="box partner-node-collect">
    <div class="header">
      <div class="title">客户流水Top占比</div>
      <svg-icon name="more" class="more" @click="handleMoreClick" />
    </div>
    <el-row :gutter="20" type="flex" align="middle" class="body">
      <el-col :span="17">
        <CustomerSalesProportion :chart-option="pieChartOption" style="height: 300%;"/>
      </el-col>
      <el-col :span="7">
        <div class="collect">
          <div class="count">
            12
          </div>
          <div class="name">总客户数</div>
          <div class="count count2">
            7
          </div>
          <div class="name">总供应商数</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import CustomerSalesProportion from './customer-sales-proportion.vue'
// 定义变量
const pieChartOption = ref({
  seriesData: [
  { name: '鲜果连锁超市', value: 75000 },
  { name: '便利生活商贸', value: 42000 },
  { name: '味之源餐饮集团', value: 88000 },
  { name: '星辰零售连锁', value: 56000 },
  { name: '绿地食品批发', value: 31000 },
  { name: '优选生活超市', value: 69000 },
  { name: '华泰贸易公司', value: 25000 },
  { name: '金海餐饮管理', value: 94000 }
]
});


</script>
<style scoped>
.partner-node-collect {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  height: calc(40vh - 48px);
  min-height: 353px;
  background: #fff;
  border-radius: 20px
}

.partner-node-collect .body {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1
}

.partner-node-collect .body .chart {
  padding-top: 16px
}

.partner-node-collect .body .collect {
  width: 154px;
  height: 230px;
  padding-top: 47px;
  padding-left: 38px;
  background: linear-gradient(135deg, transparent, #f8f8f9 0) 0 0, linear-gradient(-135deg, transparent 12px, #f8f8f9 0) 100% 0, linear-gradient(-45deg, transparent, #f8f8f9 0) 100% 100%, linear-gradient(45deg, transparent 12px, #f8f8f9 0) 0 100%;
  background-size: 50% 50%;
  background-repeat: no-repeat
}

.partner-node-collect .body .collect .count {
  height: 33px;
  font-size: 24px;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: 600;
  color: #072074;
  line-height: 33px
}

.partner-node-collect .body .collect .count2 {
  margin-top: 20px
}

.partner-node-collect .body .collect .name {
  height: 17px;
  margin-top: 6px;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #000412;
  line-height: 17px
}

.partner-node-collect .more {
  color: #5f84ff;
  cursor: pointer
}
</style>
