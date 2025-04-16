import request from '@/config/axios'

export interface Product {
  productId: number;
  productName: string;
  stockCount: number | null;
  unitId: number | null;
  unitName: string;
  saleCount: number | null;
  totalSales: number | null;
}

interface Category {
  categoryId: number;
  categoryName: string;
  products: Product[];
}

export interface ProductSaleCountRespVO {
  startTime: string; // "2025-04-06 16:00:00"
  endTime: string; // "2025-04-07 16:00:00"
  saleData: Category[];
}

export interface ProductSalesRespVO {
  startTime: string; // "2025-04-06 16:00:00"
  endTime: string; // "2025-04-07 16:00:00"
  saleData: Product[];
}

export interface ProductSaleParams {
  startTime: string; // 格式： "yyyy-MM-dd HH:mm:ss"
  endTime: string;   // 格式： "yyyy-MM-dd HH:mm:ss"
}

export const AnalysisProductApi = {

  getProductSaleCountBasedCategory: async (params: ProductSaleParams): Promise<ProductSaleCountRespVO> => {
    return await request.get({ url: `/erp/analysis/product-sale-count-based-category`, params })
  },
  getProductSales: async (params: ProductSaleParams): Promise<ProductSalesRespVO> => {
    return await request.get({ url: `/erp/analysis/product-sales`, params})
  },
  getProductStock: async (): Promise<Product[]> => {
    return await request.get({ url: `/erp/analysis/product-stock`})
  }

}
