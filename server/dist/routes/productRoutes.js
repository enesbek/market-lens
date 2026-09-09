"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mockData_js_1 = require("../data/mockData.js");
const simulationEngine_js_1 = require("../engines/simulationEngine.js");
const router = (0, express_1.Router)();
let products = [...mockData_js_1.INITIAL_PRODUCTS];
// List all products with baseline unit economics
router.get('/', (_req, res) => {
    const enrichedProducts = products.map(p => ({
        ...p,
        baselineUnitEconomics: (0, simulationEngine_js_1.calculateUnitEconomics)(p)
    }));
    res.json({ success: true, count: enrichedProducts.length, data: enrichedProducts });
});
// Get single product
router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
    }
    const baseline = (0, simulationEngine_js_1.calculateUnitEconomics)(product);
    res.json({ success: true, data: { ...product, baselineUnitEconomics: baseline } });
});
// Create product
router.post('/', (req, res) => {
    const body = req.body;
    if (!body.title || !body.listingPrice || !body.costPrice || !body.category) {
        return res.status(400).json({ success: false, error: 'Zorunlu alanlar eksik' });
    }
    const newProduct = {
        id: `prod-${Date.now()}`,
        sku: body.sku || `SKU-${Date.now()}`,
        barcode: body.barcode || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
        title: body.title,
        category: body.category,
        marketplace: body.marketplace || 'trendyol',
        listingPrice: Number(body.listingPrice),
        costPrice: Number(body.costPrice),
        costVatRate: body.costVatRate ? Number(body.costVatRate) : 20,
        saleVatRate: body.saleVatRate ? Number(body.saleVatRate) : 20,
        desi: body.desi ? Number(body.desi) : 1,
        currentMonthlySales: body.currentMonthlySales ? Number(body.currentMonthlySales) : 10,
        stock: body.stock ? Number(body.stock) : 50,
        imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
        customCommissionRate: body.customCommissionRate ? Number(body.customCommissionRate) : undefined
    };
    products.unshift(newProduct);
    const baseline = (0, simulationEngine_js_1.calculateUnitEconomics)(newProduct);
    res.status(201).json({
        success: true,
        data: { ...newProduct, baselineUnitEconomics: baseline }
    });
});
// Update product
router.put('/:id', (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
    }
    const updated = {
        ...products[index],
        ...req.body,
        listingPrice: req.body.listingPrice !== undefined ? Number(req.body.listingPrice) : products[index].listingPrice,
        costPrice: req.body.costPrice !== undefined ? Number(req.body.costPrice) : products[index].costPrice,
        desi: req.body.desi !== undefined ? Number(req.body.desi) : products[index].desi,
    };
    products[index] = updated;
    const baseline = (0, simulationEngine_js_1.calculateUnitEconomics)(updated);
    res.json({
        success: true,
        data: { ...updated, baselineUnitEconomics: baseline }
    });
});
// Delete product
router.delete('/:id', (req, res) => {
    const initialLen = products.length;
    products = products.filter(p => p.id !== req.params.id);
    if (products.length === initialLen) {
        return res.status(404).json({ success: false, error: 'Ürün bulunamadı' });
    }
    res.json({ success: true, message: 'Ürün başarıyla silindi' });
});
exports.default = router;
