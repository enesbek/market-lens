"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mockData_js_1 = require("../data/mockData.js");
const router = (0, express_1.Router)();
let campaigns = [...mockData_js_1.INITIAL_CAMPAIGNS];
// List all campaigns
router.get('/', (req, res) => {
    const marketplace = req.query.marketplace;
    let filtered = campaigns;
    if (marketplace) {
        filtered = campaigns.filter(c => c.marketplace === marketplace);
    }
    res.json({ success: true, count: filtered.length, data: filtered });
});
// Create custom campaign
router.post('/', (req, res) => {
    const body = req.body;
    if (!body.title || !body.type || !body.marketplace) {
        return res.status(400).json({ success: false, error: 'Kampanya başlığı, türü ve pazaryeri zorunludur' });
    }
    const newCampaign = {
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
exports.default = router;
