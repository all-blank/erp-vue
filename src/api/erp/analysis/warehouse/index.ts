import request from '@/config/axios'


// ERP 一级食品分类 VO
export interface ErpProductCategoryVO {
  categoryId: number // 分类编号
  categoryName: string // 分类名称
}

// ERP 产品销量排行 VO
export interface ErpAnalysisProductRankRespVO {
    productId: number // 产品编号
    productName: string // 产品名称
    salesCount: number // 销售数量
    unit: string // 单位
}

export interface ProductVO {
  productId: number
  productName: string // 产品名称
  stockCount: number // 库存数量
  unit: string // 单位
}

// ERP 仓库产品库存 VO
export interface ErpAnalysisWarehouseStockRespVO {
    warehouseId: number // 仓库编号
    warehouseName: string // 仓库名称
    products: ProductVO // 产品信息
}

// ERP 分析图表 API
export const AnalysisWarehouseApi = {
  // 获取一级产品分类信息
  getProductCategory: async (): Promise<ErpProductCategoryVO[]> => {
    return await request.get({ url: '/erp/analysis/productCategory' })
  },
  // 根据分类ID获得产品销量排行
  getProductRank: async (categoryId : number): Promise<ErpAnalysisProductRankRespVO[]> => {
    return await request.get({ url: `/erp/analysis/productRank?categoryId=` + categoryId })
  },
  // 获取仓库产品库存信息
  getWarehouseStock: async () => {
    return await request.get({ url: '/erp/analysis/warehouse-stock' })
  }

}