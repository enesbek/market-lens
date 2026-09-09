import { Router, Request, Response } from 'express';
import { INITIAL_PRODUCTS, INITIAL_CAMPAIGNS } from '../data/mockData.js';
import { Product, Campaign } from '../types/index.js';
import { simulateProductCampaign, simulateBatchCampaign, calculateUnitEconomics } from '../engines/simulationEngine.js';

const router = Router();

// 1. Tekil Ürün & Kampanya Simülasyonu
router.post('/single', (req: Request, res: Response) => {
  const { productId, campaignId, customDiscountPercent, customProduct, customCampaign } = req.body;

  let product: Product | undefined;
  if (customProduct) {
    product = customProduct;
  } else if (productId) {
    product = INITIAL_PRODUCTS.find(p => p.id === productId);
  }

  if (!product) {
    return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
  }

  let campaign: Campaign | undefined;
  if (customCampaign) {
    campaign = customCampaign;
  } else if (campaignId) {
    campaign = INITIAL_CAMPAIGNS.find(c => c.id === campaignId);
  }
  
  if (!campaign) {
    campaign = {
      id: 'default-sim',
      title: 'Canlı Simülasyon (%15 İndirim)',
      type: 'cart_percent',
      marketplace: product.marketplace,
      discountPercent: customDiscountPercent || 15,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      description: 'Hızlı hesaplama simülasyonu'
    };
  }

  const result = simulateProductCampaign(product, campaign, customDiscountPercent);
  res.json({ success: true, data: result });
});

// 2. Anlık Serbest Hesaplayıcı (Ad-Hoc Playground)
router.post('/playground', (req: Request, res: Response) => {
  const {
    listingPrice,
    costPrice,
    category = 'Kadın Giyim & Moda',
    marketplace = 'trendyol',
    desi = 1,
    campaignType = 'cart_percent',
    discountPercent = 15,
    fixedDiscountAmount = 0,
    minCartAmount = 0,
    platformContributionPercent = 0,
    costVatRate = 20,
    saleVatRate = 20,
    customCommissionRate,
    currentMonthlySales = 50
  } = req.body;

  const mockProduct: Product = {
    id: 'temp-playground',
    sku: 'PLAYGROUND-TEMP',
    barcode: '0000000000000',
    title: 'Simülatör Ürünü',
    category,
    marketplace,
    listingPrice: Number(listingPrice) || 200,
    costPrice: Number(costPrice) || 80,
    costVatRate: Number(costVatRate),
    saleVatRate: Number(saleVatRate),
    desi: Number(desi),
    currentMonthlySales: Number(currentMonthlySales),
    stock: 100,
    customCommissionRate: customCommissionRate ? Number(customCommissionRate) : undefined
  };

  const mockCampaign: Campaign = {
    id: 'temp-campaign',
    title: 'Özel Senaryo',
    type: campaignType,
    marketplace,
    discountPercent: Number(discountPercent),
    fixedDiscountAmount: Number(fixedDiscountAmount),
    minCartAmount: Number(minCartAmount),
    platformContributionPercent: Number(platformContributionPercent),
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    description: 'Anlık senaryo'
  };

  const result = simulateProductCampaign(mockProduct, mockCampaign);
  res.json({ success: true, data: result });
});

// 3. Toplu Kampanya Analizi (Batch Simulator)
router.post('/batch', (req: Request, res: Response) => {
  const { campaignId, customCampaign, categoryFilter, marketplaceFilter } = req.body;

  let campaign: Campaign | undefined;
  if (customCampaign) {
    campaign = customCampaign;
  } else if (campaignId) {
    campaign = INITIAL_CAMPAIGNS.find(c => c.id === campaignId);
  }

  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Kampanya bulunamadı' });
  }

  let targetProducts = [...INITIAL_PRODUCTS];
  if (marketplaceFilter) {
    targetProducts = targetProducts.filter(p => p.marketplace === marketplaceFilter);
  }
  if (categoryFilter) {
    targetProducts = targetProducts.filter(p => p.category === categoryFilter);
  }

  const batchSummary = simulateBatchCampaign(targetProducts, campaign);
  res.json({ success: true, data: batchSummary });
});

// 4. Akıllı Danışman & Mağaza Geneli Tuzak Taraması
router.get('/insights', (_req: Request, res: Response) => {
  const products = INITIAL_PRODUCTS;
  const campaigns = INITIAL_CAMPAIGNS;

  // Tüm ürünler üzerinde aktif kampanyaları tara
  const baremRisks: { product: Product; campaign: Campaign; dropPrice: number; issue: string }[] = [];
  const lossRisks: { product: Product; campaign: Campaign; lossAmount: number }[] = [];
  const topOpportunities: { product: Product; campaign: Campaign; profit: number; margin: number }[] = [];

  products.forEach(product => {
    campaigns.filter(c => c.marketplace === product.marketplace).forEach(camp => {
      const sim = simulateProductCampaign(product, camp);
      if (sim.riskLevel === 'CRITICAL_LOSS') {
        lossRisks.push({
          product,
          campaign: camp,
          lossAmount: Math.abs(sim.simulated.netProfit)
        });
      } else if (sim.riskLevel === 'TRAP_SHIPPING_THRESHOLD') {
        baremRisks.push({
          product,
          campaign: camp,
          dropPrice: sim.simulated.price,
          issue: `Fiyat ${product.listingPrice} TL'den ${sim.simulated.price} TL'ye düşerek 200 TL kargo bareminin altına iniyor.`
        });
      } else if (sim.riskLevel === 'EXCELLENT') {
        topOpportunities.push({
          product,
          campaign: camp,
          profit: sim.simulated.netProfit,
          margin: sim.simulated.marginPercent
        });
      }
    });
  });

  res.json({
    success: true,
    data: {
      totalProductsAnalyzed: products.length,
      totalCampaignsAnalyzed: campaigns.length,
      baremRisks,
      lossRisks,
      topOpportunities
    }
  });
});

export default router;
