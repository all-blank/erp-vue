import request from '@/config/axios'


export interface SaleInfo {

  startTime: string; // "2025-04-06 16:00:00"
  endTime: string; // "2025-04-07 16:00:00"
  totalSaleCount: number;
  totalSales: number;

}

export interface SaleOrderInfo {

  startTime: string; // "2025-04-06 16:00:00"
  endTime: string; // "2025-04-07 16:00:00"

  saleOrderTotalCount: number;
  noApprovalSaleOrderCount: number;
  saleOutOrderCount: number;
  saleReturnOrderCount: number;

}

export interface SaleParams {
  startTime: string; // 格式： "yyyy-MM-dd HH:mm:ss"
  endTime: string;   // 格式： "yyyy-MM-dd HH:mm:ss"
}


export const AnalysisSaleApi = {
  getSaleInfo: async (params: SaleParams): Promise<SaleInfo> => {
    return await request.get({ url: `/erp/analysis/sale-info`, params })
  },
  getSaleOrderStatus: async (params: SaleParams): Promise<SaleOrderInfo> => {
    return await request.get({ url: `/erp/analysis/sale-order-info`, params })
  }
}