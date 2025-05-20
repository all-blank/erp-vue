<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
    :disabled="disabled"
  >
    <el-table :data="formData" show-summary :summary-method="getSummaries" class="-mt-10px">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="产品名称" min-width="180">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.productId`" :rules="formRules.productId" class="mb-0px!">
            <el-select
              v-model="row.productId"
              clearable
              filterable
              @change="onChangeProduct($event, row)"
              placeholder="请选择产品"
            >
              <el-option
                v-for="item in productList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="库存" min-width="100">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.stockCount" :formatter="erpCountInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="条码" min-width="150">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.productBarCode" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="80">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.productUnitName" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="数量" prop="count" fixed="right" min-width="140">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.count`" :rules="formRules.count" class="mb-0px!">
            <el-input-number
              v-model="row.count"
              controls-position="right"
              :min="0.001"
              :precision="3"
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="产品单价" fixed="right" min-width="120">
        <template #default="{ row, $index }">
          <el-form-item
            :prop="`${$index}.productPrice`"
            :rules="formRules.productPrice"
            class="mb-0px!"
          >
            <el-input-number
              v-model="row.productPrice"
              controls-position="right"
              :min="0.01"
              :precision="2"
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="金额" prop="totalProductPrice" fixed="right" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.totalProductPrice`" class="mb-0px!">
            <el-input
              disabled
              v-model="row.totalProductPrice"
              :formatter="erpPriceInputFormatter"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税率（%）" fixed="right" min-width="115">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxPercent`" class="mb-0px!">
            <el-input-number
              v-model="row.taxPercent"
              controls-position="right"
              :min="0"
              :precision="2"
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税额" prop="taxPrice" fixed="right" min-width="120">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxPrice`" class="mb-0px!">
            <el-input disabled v-model="row.taxPrice" :formatter="erpPriceInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税额合计" prop="totalPrice" fixed="right" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.totalPrice`" class="mb-0px!">
            <el-input disabled v-model="row.totalPrice" :formatter="erpPriceInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.remark`" class="mb-0px!">
            <el-input v-model="row.remark" placeholder="请输入备注" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="60">
        <template #default="{ $index }">
          <el-button @click="handleDelete($index)" link>—</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>
  <el-row justify="center" class="mt-3" v-if="!disabled">
    <el-button @click="handleAdd" round>+ 添加采购产品</el-button>
  </el-row>
</template>

<script setup lang="ts">
import { ProductApi, ProductVO } from '@/api/erp/product/product'
import { StockApi } from '@/api/erp/stock/stock'
import {
  erpCountInputFormatter,
  erpPriceInputFormatter,
  erpPriceMultiply,
  getSumValue
} from '@/utils'

const props = defineProps<{
  items: any[] // 订单产品清单
  disabled: boolean // 是否禁用表单
  supplierId?: number // 供应商 ID
}>()

const formLoading = ref(false) // 表单加载状态
const formData = ref(props.items || []) // 产品清单数据
const formRules = reactive({
  productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
  productPrice: [{ required: true, message: '产品单价不能为空', trigger: 'blur' }],
  count: [{ required: true, message: '产品数量不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单引用
const productList = ref<ProductVO[]>([]) // 产品列表
const productCache = new Map<number, ProductVO[]>() // 产品缓存

// 同步父组件传入的 items 到 formData
watch(
  () => props.items,
  (val) => {
    formData.value = val || []
  },
  { immediate: true }
)

// 计算产品价格相关字段
watch(
  () => formData.value,
  (val) => {
    if (!val || val.length === 0) return
    val.forEach((item) => {
      item.totalProductPrice = erpPriceMultiply(item.productPrice, item.count)
      item.taxPrice = erpPriceMultiply(item.totalProductPrice, item.taxPercent / 100.0)
      item.totalPrice = item.totalProductPrice + (item.taxPrice || 0)
    })
  },
  { deep: true }
)

// 监听 supplierId 变化，仅加载产品列表
watch(
  () => props.supplierId,
  (newSupplierId) => {
    loadProducts(newSupplierId)
  }
)

// 计算表格合计
const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column, index: number) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (['count', 'totalProductPrice', 'taxPrice', 'totalPrice'].includes(column.property)) {
      const sum = getSumValue(data.map((item) => Number(item[column.property])))
      sums[index] =
        column.property === 'count' ? erpCountInputFormatter(sum) : erpPriceInputFormatter(sum)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

// 添加新产品行
const handleAdd = () => {
  const row = {
    id: undefined,
    productId: undefined,
    productUnitName: undefined,
    productBarCode: undefined,
    productPrice: undefined,
    stockCount: undefined,
    count: 1,
    totalProductPrice: undefined,
    taxPercent: undefined,
    taxPrice: undefined,
    totalPrice: undefined,
    remark: undefined
  }
  formData.value.push(row)
}

// 删除产品行
const handleDelete = (index: number) => {
  formData.value.splice(index, 1)
}

// 处理产品选择变化
const onChangeProduct = (productId, row) => {
  const product = productList.value.find((item) => item.id === productId)
  if (product) {
    row.productUnitName = product.unitName
    row.productBarCode = product.barCode
    row.productPrice = product.purchasePrice
  }
  setStockCount(row)
}

// 加载产品库存
const setStockCount = async (row: any) => {
  if (!row.productId) return
  const count = await StockApi.getStockCount(row.productId)
  row.stockCount = count || 0
}

// 加载产品列表
const loadProducts = async (supplierId?: number) => {
  try {
    if (!supplierId) {
      productList.value = await ProductApi.getProductSimpleList()
      return
    }
    const cachedProducts = productCache.get(supplierId)
    if (cachedProducts) {
      productList.value = cachedProducts
      return
    }
    const freshProducts = await ProductApi.getProductListBySupplierId(supplierId)
    productCache.set(supplierId, freshProducts)
    productList.value = freshProducts
  } catch (error) {
    ElMessage.error('产品加载失败')
  }
}

// 初始化时为新建订单添加一行
onMounted(() => {
  if (formData.value.length === 0) {
    handleAdd()
  }
  loadProducts(props.supplierId)
})

// 表单校验方法
const validate = () => {
  return formRef.value.validate()
}
defineExpose({ validate })
</script>