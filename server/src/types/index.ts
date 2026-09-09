export type MarketplaceType = 'trendyol' | 'hepsiburada' | 'ciceksepeti';

export type CampaignType = 
  | 'cart_percent'              // Sepette %X İndirim
  | 'cart_fixed_over_limit'     // X TL Üzeri Y TL İndirim
  | 'flash_deal'                // Flaş İndirim / Süper Fiyat (Doğrudan Fiyat İndirimi)
  | 'second_item_discount'      // 2. Ürüne %X İndirim (Çok Al Az Öde)
  | 'seller_coupon'             // Mağaza Kuponu (Satıcı Karşılar)
  | 'platform_coupon';          // Platform Destekli Kupon (Ortak Karşılama)

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  title: string;
  category: string;
  marketplace: MarketplaceType;
  listingPrice: number;        // Güncel Satış Fiyatı (KDV Dahil)
  costPrice: number;           // Ürün Maliyeti / COGS (KDV Hariç veya Dahil)
  costVatRate: number;         // Alış KDV Oranı (%) örn: 20, 10, 1
  saleVatRate: number;         // Satış KDV Oranı (%) örn: 20, 10, 1
  desi: number;                // Kargo Desi Bilgisi
  currentMonthlySales: number; // Aylık Ortalama Satış Adedi
  stock: number;
  imageUrl?: string;
  customCommissionRate?: number; // Özel komisyon anlaşması varsa (%)
}
/*
{
    "items": [
    {
        "barcode": "TestBarcode",
        "title": "string",
        "description": "string",
        "productMainId": "string",
        "brandId": 1,
        "categoryId": 1,
        "quantity": 0,
        "stockCode": "string",
        "origin": "AD",
        "dimensionalWeight": 0,
        "listPrice": 0,
        "salePrice": 0,
        "vatRate": 0,
        "lotNumber": "string",
        "cargoProviders": ["cargo company code"],
        "shipmentAddressId": 0,
        "returningAddressId": 0,
        "deliveryOption": {
            "deliveryDuration": 0,
            "fastDeliveryType": "string"
        },
        "images": [
            {
                "url": "trendyol.com/test.jpeg"
            }
        ],
        "attributes": [
            {
                "attributeId": 1,
                "attributeValueId": 1
            },
            {
                "attributeId": 2,
                "customAttributeValue": "String"
            }
        ]
    }
]
}
*/

export interface Campaign {
  id: string;
  title: string;
  type: CampaignType;
  marketplace: MarketplaceType;
  discountPercent?: number;            // örn: 15 (%15 indirim)
  fixedDiscountAmount?: number;        // örn: 50 (50 TL indirim)
  minCartAmount?: number;              // örn: 300 (300 TL ve üzeri için)
  platformContributionPercent?: number;// Kuponun ne kadarını platform karşılıyor? (örn: %50)
  startDate: string;
  endDate: string;
  description: string;
  badge?: string;
  targetCategories?: string[];
  minRequiredDiscountPercent?: number;
}

export interface UnitEconomics {
  price: number;                       // Nihai Satış Fiyatı (KDV Dahil)
  discountAmount: number;              // Uygulanan İndirim (TL)
  cogs: number;                        // Ürün Alış/Üretim Maliyeti (TL)
  
  // Pazaryeri Kesintileri
  commissionRate: number;              // Uygulanan Komisyon Oranı (%)
  commissionAmount: number;            // Komisyon Tutarı (KDV Dahil TL)
  commissionVat: number;               // Komisyon KDV'si (%20)
  
  serviceFee: number;                  // Pazaryeri İşlem/Hizmet Bedeli (TL)
  
  // Kargo Hesabı
  desi: number;
  shippingFee: number;                 // Satıcıya Yansıyan Kargo Ücreti (KDV Dahil TL)
  shippingPayer: 'seller' | 'buyer';   // Kargo satıcıda mı alıcıda mı?
  isFreeShippingThresholdPassed: boolean; // Barem üstü mü?
  
  // Vergi & KDV Muhasebesi
  grossSaleVat: number;                // Satıştan Doğan KDV
  deductibleVat: number;               // İndirilebilir KDV (Maliyet KDV + Komisyon KDV + Kargo KDV)
  netVatPayable: number;               // Devlete Ödenecek / Kalan Net KDV
  stopajWithholding: number;           // Stopaj kesintisi (%1)
  
  // Net Sonuç
  netPayoutFromMarketplace: number;    // Pazaryerinden Hesaba Yatan Tutar (Fiyat - Komisyon - Kargo - Hizmet)
  netProfit: number;                   // Net Kâr (TL)
  marginPercent: number;               // Net Kâr Marjı (%) [Net Kâr / Satış Fiyatı]
  roiPercent: number;                  // Yatırım Getirisi / ROI (%) [Net Kâr / Maliyet]
}

export type RiskLevel = 
  | 'EXCELLENT'               // Yüksek Kâr & Harika Fırsat
  | 'SAFE_PROFITABLE'         // Kârlı ve Güvenli
  | 'WARNING_LOW_MARGIN'      // Marj %5 altına düşüyor
  | 'TRAP_SHIPPING_THRESHOLD' // Kargo barem tuzağı (Ürün eşik altına inip kargo satıcıya bindi!)
  | 'CRITICAL_LOSS';          // Zararına Satış (Eksi Kâr!)

export interface SimulationResult {
  product: Product;
  campaign: Campaign;
  
  baseline: UnitEconomics;    // Kampanya Öncesi Normal Durum
  simulated: UnitEconomics;   // Kampanya Sonrası Durum
  
  // Karşılaştırma & Değişim
  profitDelta: number;        // Kâr Değişimi (TL) [simulated - baseline]
  profitDeltaPercent: number; // Kâr Değişim Oranı (%)
  marginDeltaPercent: number; // Marj Değişimi (Puan)
  
  // Başa Baş Analizi (Break-even Elasticity)
  breakEvenSalesMultiplier: number; // Eski toplam kârı yakalamak için satış kaç katına çıkmalı?
  requiredUnitSales: number;        // Gereken yeni aylık satış adedi
  
  // Risk & Danışman Değerlendirmesi
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
