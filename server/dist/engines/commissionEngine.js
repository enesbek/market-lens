"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMMISSION_RATES = void 0;
exports.getCategoryCommission = getCategoryCommission;
// Türkiye Pazaryerleri Standart Kategori Komisyon Oranları (2024-2026)
exports.DEFAULT_COMMISSION_RATES = [
    // Trendyol
    { category: 'Kadın Giyim & Moda', marketplace: 'trendyol', commissionRate: 22.0, serviceFee: 4.99 },
    { category: 'Erkek Giyim & Moda', marketplace: 'trendyol', commissionRate: 22.0, serviceFee: 4.99 },
    { category: 'Ayakkabı & Çanta', marketplace: 'trendyol', commissionRate: 21.5, serviceFee: 4.99 },
    { category: 'Kozmetik & Kişisel Bakım', marketplace: 'trendyol', commissionRate: 17.0, serviceFee: 4.99 },
    { category: 'Elektronik Aksesuar & Kulaklık', marketplace: 'trendyol', commissionRate: 16.5, serviceFee: 4.99 },
    { category: 'Bilgisayar & Donanım', marketplace: 'trendyol', commissionRate: 7.0, serviceFee: 4.99 },
    { category: 'Ev & Mutfak / Dekorasyon', marketplace: 'trendyol', commissionRate: 20.0, serviceFee: 4.99 },
    { category: 'Anne & Bebek', marketplace: 'trendyol', commissionRate: 16.0, serviceFee: 4.99 },
    { category: 'Spor & Outdoor', marketplace: 'trendyol', commissionRate: 18.0, serviceFee: 4.99 },
    { category: 'Oto Aksesuar & Hırdavat', marketplace: 'trendyol', commissionRate: 17.5, serviceFee: 4.99 },
    { category: 'Gıda & Süpermarket', marketplace: 'trendyol', commissionRate: 14.0, serviceFee: 4.99 },
    // Hepsiburada
    { category: 'Kadın Giyim & Moda', marketplace: 'hepsiburada', commissionRate: 21.0, serviceFee: 5.40 },
    { category: 'Erkek Giyim & Moda', marketplace: 'hepsiburada', commissionRate: 21.0, serviceFee: 5.40 },
    { category: 'Ayakkabı & Çanta', marketplace: 'hepsiburada', commissionRate: 20.5, serviceFee: 5.40 },
    { category: 'Kozmetik & Kişisel Bakım', marketplace: 'hepsiburada', commissionRate: 16.5, serviceFee: 5.40 },
    { category: 'Elektronik Aksesuar & Kulaklık', marketplace: 'hepsiburada', commissionRate: 15.5, serviceFee: 5.40 },
    { category: 'Bilgisayar & Donanım', marketplace: 'hepsiburada', commissionRate: 6.5, serviceFee: 5.40 },
    { category: 'Ev & Mutfak / Dekorasyon', marketplace: 'hepsiburada', commissionRate: 19.0, serviceFee: 5.40 },
    { category: 'Anne & Bebek', marketplace: 'hepsiburada', commissionRate: 15.5, serviceFee: 5.40 },
    { category: 'Spor & Outdoor', marketplace: 'hepsiburada', commissionRate: 17.5, serviceFee: 5.40 },
    { category: 'Oto Aksesuar & Hırdavat', marketplace: 'hepsiburada', commissionRate: 16.5, serviceFee: 5.40 },
    { category: 'Gıda & Süpermarket', marketplace: 'hepsiburada', commissionRate: 13.5, serviceFee: 5.40 },
];
function getCategoryCommission(category, marketplace, customRate) {
    if (customRate !== undefined && customRate > 0) {
        const defaultEntry = exports.DEFAULT_COMMISSION_RATES.find(r => r.marketplace === marketplace && r.category === category);
        return {
            commissionRate: customRate,
            serviceFee: defaultEntry ? defaultEntry.serviceFee : (marketplace === 'trendyol' ? 4.99 : 5.40)
        };
    }
    const match = exports.DEFAULT_COMMISSION_RATES.find(r => r.marketplace === marketplace && r.category.toLowerCase() === category.toLowerCase());
    if (match) {
        return { commissionRate: match.commissionRate, serviceFee: match.serviceFee };
    }
    // Varsayılan genel komisyon
    return {
        commissionRate: marketplace === 'trendyol' ? 18.0 : 17.5,
        serviceFee: marketplace === 'trendyol' ? 4.99 : 5.40
    };
}
