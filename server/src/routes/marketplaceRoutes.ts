import { Router, Request, Response } from 'express';
import { DEFAULT_COMMISSION_RATES } from '../engines/commissionEngine.js';
import { SHIPPING_RATES, DEFAULT_FREE_SHIPPING_THRESHOLD } from '../engines/shippingEngine.js';

const router = Router();

const MARKETPLACE_ACCOUNTS = [
  {
    id: 'mp-trendyol',
    name: 'Trendyol Mağazası',
    marketplace: 'trendyol',
    supplierId: '948210',
    apiKey: 'ty_live_pk_********************',
    status: 'connected',
    lastSync: 'Bugün 20:45',
    activeProductsCount: 142,
    activeCampaignsCount: 4,
    healthScore: '98/100'
  },
  {
    id: 'mp-hepsiburada',
    name: 'Hepsiburada Satıcı Hesabı',
    marketplace: 'hepsiburada',
    merchantId: 'hb-m-581903',
    apiKey: 'hb_sec_key_********************',
    status: 'connected',
    lastSync: 'Bugün 20:30',
    activeProductsCount: 88,
    activeCampaignsCount: 3,
    healthScore: '95/100'
  }
];

// Get status & accounts
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      accounts: MARKETPLACE_ACCOUNTS,
      shippingTiers: SHIPPING_RATES,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      commissionRates: DEFAULT_COMMISSION_RATES
    }
  });
});

// Trigger mock sync
router.post('/sync', (req: Request, res: Response) => {
  const { marketplace } = req.body;
  res.json({
    success: true,
    message: `${marketplace || 'Tüm pazaryerleri'} başarıyla senkronize edildi. Fiyatlar ve kampanyalar güncellendi.`,
    syncTime: new Date().toLocaleTimeString('tr-TR')
  });
});

export default router;
