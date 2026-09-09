export type MarketplaceType = 'trendyol' | 'hepsiburada' | 'ciceksepeti';

export type CampaignType = 
  | 'cart_percent'              // Sepette %X İndirim
  | 'cart_fixed_over_limit'     // X TL Üzeri Y TL İndirim
  | 'flash_deal'                // Flaş İndirim / Süper Fiyat
  | 'second_item_discount'      // 2. Ürüne %X İndirim
  | 'seller_coupon'             // Mağaza Kuponu
  | 'platform_coupon';          // Platform Destekli Kupon

export interface UnitEconomics {
  price: number;
  discountAmount: number;
  cogs: number;
  commissionRate: number;
  commissionAmount: number;
  commissionVat: number;
  serviceFee: number;
  desi: number;
  shippingFee: number;
  shippingPayer: 'seller' | 'buyer';
  isFreeShippingThresholdPassed: boolean;
  grossSaleVat: number;
  deductibleVat: number;
  netVatPayable: number;
  stopajWithholding: number;
  netPayoutFromMarketplace: number;
  netProfit: number;
  marginPercent: number;
  roiPercent: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  title: string;
  category: string;
  marketplace: MarketplaceType;
  listingPrice: number;
  costPrice: number;
  costVatRate: number;
  saleVatRate: number;
  desi: number;
  currentMonthlySales: number;
  stock: number;
  imageUrl?: string;
  customCommissionRate?: number;
  baselineUnitEconomics?: UnitEconomics;
}

export interface Campaign {
  id: string;
  title: string;
  type: CampaignType;
  marketplace: MarketplaceType;
  discountPercent?: number;
  fixedDiscountAmount?: number;
  minCartAmount?: number;
  platformContributionPercent?: number;
  startDate: string;
  endDate: string;
  description: string;
  badge?: string;
  targetCategories?: string[];
  minRequiredDiscountPercent?: number;
}

export type RiskLevel = 
  | 'EXCELLENT' 
  | 'SAFE_PROFITABLE' 
  | 'WARNING_LOW_MARGIN' 
  | 'TRAP_SHIPPING_THRESHOLD' 
  | 'CRITICAL_LOSS';

export interface SimulationResult {
  product: Product;
  campaign: Campaign;
  baseline: UnitEconomics;
  simulated: UnitEconomics;
  profitDelta: number;
  profitDeltaPercent: number;
  marginDeltaPercent: number;
  breakEvenSalesMultiplier: number;
  requiredUnitSales: number;
  riskLevel: RiskLevel;
  warnings: string[];
  recommendations: string[];
  smartAdvice: string;
}

export interface BatchSimulationSummary {
  campaign: Campaign;
  totalProductsCount: number;
  profitableCount: number;
  warningCount: number;
  lossMakingCount: number;
  trapCount: number;
  totalBaselineProjectedProfit: number;
  totalSimulatedProjectedProfit: number;
  netProfitImpact: number;
  results: SimulationResult[];
}

export interface MarketplaceAccount {
  id: string;
  name: string;
  marketplace: MarketplaceType;
  supplierId?: string;
  merchantId?: string;
  apiKey: string;
  status: string;
  lastSync: string;
  activeProductsCount: number;
  activeCampaignsCount: number;
  healthScore: string;
}
