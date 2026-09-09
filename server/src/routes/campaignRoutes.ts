import { Router, Request, Response } from 'express';
import { INITIAL_CAMPAIGNS } from '../data/mockData.js';
import { Campaign } from '../types/index.js';

const router = Router();
let campaigns: Campaign[] = [...INITIAL_CAMPAIGNS];

// List all campaigns
router.get('/', (req: Request, res: Response) => {
  const marketplace = req.query.marketplace as string;
  let filtered = campaigns;
  if (marketplace) {
    filtered = campaigns.filter(c => c.marketplace === marketplace);
  }
  res.json({ success: true, count: filtered.length, data: filtered });
});

// Create custom campaign
router.post('/', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.title || !body.type || !body.marketplace) {
    return res.status(400).json({ success: false, error: 'Kampanya başlığı, türü ve pazaryeri zorunludur' });
  }

  const newCampaign: Campaign = {
    id: `camp-custom-${Date.now()}`,
    title: body.title,
    type: body.type,
    marketplace: body.marketplace,
    discountPercent: body.discountPercent ? Number(body.discountPercent) : undefined,
    fixedDiscountAmount: body.fixedDiscountAmount ? Number(body.fixedDiscountAmount) : undefined,
    minCartAmount: body.minCartAmount ? Number(body.minCartAmount) : undefined,
    platformContributionPercent: body.platformContributionPercent ? Number(body.platformContributionPercent) : undefined,
    startDate: body.startDate || new Date().toISOString().split('T')[0],
    endDate: body.endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    description: body.description || 'Satıcı tarafından oluşturulan özel kampanya simülasyonu',
    badge: body.badge || 'Özel Simülasyon',
    targetCategories: body.targetCategories
  };

  campaigns.unshift(newCampaign);
  res.status(201).json({ success: true, data: newCampaign });
});

export default router;
