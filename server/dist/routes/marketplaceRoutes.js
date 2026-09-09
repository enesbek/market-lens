"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commissionEngine_js_1 = require("../engines/commissionEngine.js");
const shippingEngine_js_1 = require("../engines/shippingEngine.js");
const router = (0, express_1.Router)();
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
router.get('/', (_req, res) => {
    res.json({
        success: true,
        data: {
            accounts: MARKETPLACE_ACCOUNTS,
            shippingTiers: shippingEngine_js_1.SHIPPING_RATES,
            freeShippingThreshold: shippingEngine_js_1.DEFAULT_FREE_SHIPPING_THRESHOLD,
            commissionRates: commissionEngine_js_1.DEFAULT_COMMISSION_RATES
        }
    });
});
// Trigger mock sync
router.post('/sync', (req, res) => {
    const { marketplace } = req.body;
    res.json({
        success: true,
        message: `${marketplace || 'Tüm pazaryerleri'} başarıyla senkronize edildi. Fiyatlar ve kampanyalar güncellendi.`,
        syncTime: new Date().toLocaleTimeString('tr-TR')
    });
});
exports.default = router;
