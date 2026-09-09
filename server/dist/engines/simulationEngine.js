"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateUnitEconomics = calculateUnitEconomics;
exports.simulateProductCampaign = simulateProductCampaign;
exports.simulateBatchCampaign = simulateBatchCampaign;
const commissionEngine_js_1 = require("./commissionEngine.js");
const shippingEngine_js_1 = require("./shippingEngine.js");
const taxEngine_js_1 = require("./taxEngine.js");
/**
 * Tek bir ürün ve kampanya koşulu için Birim İktisadı (Unit Economics) hesaplar
 */
function calculateUnitEconomics(product, campaign, customDiscountPercent) {
    const originalPrice = product.listingPrice;
    let discountAmount = 0;
    let discountedPrice = originalPrice;
    let sellerBorneDiscount = 0;
    if (campaign) {
        switch (campaign.type) {
            case 'cart_percent':
            case 'flash_deal': {
                const percent = customDiscountPercent !== undefined ? customDiscountPercent : (campaign.discountPercent || 0);
                discountAmount = (originalPrice * percent) / 100;
                discountedPrice = Math.max(0, originalPrice - discountAmount);
                sellerBorneDiscount = discountAmount;
                break;
            }
            case 'cart_fixed_over_limit': {
                const minLimit = campaign.minCartAmount || 0;
                const fixedAmt = campaign.fixedDiscountAmount || 0;
                if (originalPrice >= minLimit) {
                    discountAmount = fixedAmt;
                    discountedPrice = Math.max(0, originalPrice - discountAmount);
                    sellerBorneDiscount = discountAmount;
                }
                break;
            }
            case 'second_item_discount': {
                // 2. Ürüne %X indirim -> Birim başına ortalama indirim = %X / 2
                const percent = campaign.discountPercent || 50;
                const avgUnitDiscountPercent = percent / 2;
                discountAmount = (originalPrice * avgUnitDiscountPercent) / 100;
                discountedPrice = Math.max(0, originalPrice - discountAmount);
                sellerBorneDiscount = discountAmount;
                break;
            }
            case 'seller_coupon': {
                if (campaign.discountPercent) {
                    discountAmount = (originalPrice * campaign.discountPercent) / 100;
                }
                else if (campaign.fixedDiscountAmount) {
                    discountAmount = campaign.fixedDiscountAmount;
                }
                discountedPrice = Math.max(0, originalPrice - discountAmount);
                sellerBorneDiscount = discountAmount;
                break;
            }
            case 'platform_coupon': {
                if (campaign.discountPercent) {
                    discountAmount = (originalPrice * campaign.discountPercent) / 100;
                }
                else if (campaign.fixedDiscountAmount) {
                    discountAmount = campaign.fixedDiscountAmount;
                }
                const platformShare = (campaign.platformContributionPercent || 50) / 100;
                sellerBorneDiscount = discountAmount * (1 - platformShare);
                discountedPrice = Math.max(0, originalPrice - discountAmount);
                break;
            }
        }
    }
    // 1. Komisyon ve Hizmet Bedeli Hesabı (İndirimli Fiyat Üzerinden)
    const { commissionRate, serviceFee } = (0, commissionEngine_js_1.getCategoryCommission)(product.category, product.marketplace, product.customCommissionRate);
    // Komisyon bedeli müşterinin ödediği nihai fiyattan kesilir
    const commissionAmount = Number(((discountedPrice * commissionRate) / 100).toFixed(2));
    const commissionVat = Number((commissionAmount - (commissionAmount / 1.20)).toFixed(2));
    // 2. Kargo Bedeli Hesabı
    const shippingInfo = (0, shippingEngine_js_1.calculateShipping)(product.desi, discountedPrice, product.marketplace);
    const shippingFee = shippingInfo.shippingFee;
    // 3. Vergi & KDV Analizi
    const taxBreakdown = (0, taxEngine_js_1.calculateTaxes)(discountedPrice, product.costPrice, product.saleVatRate || 20, product.costVatRate || 20, commissionAmount, shippingFee);
    // 4. Pazaryerinden Hesaba Yatan Tutar (Net Payout)
    // Pazaryeri faturayı keserken: Satış Tutarı - Komisyon - Hizmet Bedeli - Kargo (satıcı ödüyorsa) - Stopaj
    const netPayoutFromMarketplace = Number((discountedPrice - commissionAmount - serviceFee - shippingFee - taxBreakdown.stopajWithholding).toFixed(2));
    // 5. Net Kâr (Maliyet ve Devlete Ödenecek KDV çıktıktan sonra cebe kalan)
    // Net Kâr = Net Payout - Ürün Alış Maliyeti (KDV dahil) - Net KDV Farkı
    const netProfit = Number((netPayoutFromMarketplace - product.costPrice - taxBreakdown.netVatPayable).toFixed(2));
    // 6. Kâr Marjı (%) ve ROI (%)
    const marginPercent = discountedPrice > 0 ? Number(((netProfit / discountedPrice) * 100).toFixed(1)) : 0;
    const roiPercent = product.costPrice > 0 ? Number(((netProfit / product.costPrice) * 100).toFixed(1)) : 0;
    return {
        price: Number(discountedPrice.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        cogs: Number(product.costPrice.toFixed(2)),
        commissionRate,
        commissionAmount,
        commissionVat,
        serviceFee,
        desi: product.desi,
        shippingFee,
        shippingPayer: shippingInfo.shippingPayer,
        isFreeShippingThresholdPassed: shippingInfo.isThresholdPassed,
        grossSaleVat: taxBreakdown.saleVatAmount,
        deductibleVat: taxBreakdown.totalDeductibleVat,
        netVatPayable: taxBreakdown.netVatPayable,
        stopajWithholding: taxBreakdown.stopajWithholding,
        netPayoutFromMarketplace,
        netProfit,
        marginPercent,
        roiPercent
    };
}
/**
 * Kampanyanın tek ürün üzerindeki etkisini, risklerini ve başa baş noktasını simüle eder
 */
function simulateProductCampaign(product, campaign, customDiscountPercent) {
    const baseline = calculateUnitEconomics(product); // Normal satış durumu
    const simulated = calculateUnitEconomics(product, campaign, customDiscountPercent); // Kampanyalı durum
    const profitDelta = Number((simulated.netProfit - baseline.netProfit).toFixed(2));
    const profitDeltaPercent = baseline.netProfit !== 0
        ? Number((((simulated.netProfit - baseline.netProfit) / Math.abs(baseline.netProfit)) * 100).toFixed(1))
        : 0;
    const marginDeltaPercent = Number((simulated.marginPercent - baseline.marginPercent).toFixed(1));
    // Başa Baş (Break-even Elasticity) Satış Çarpanı
    let breakEvenSalesMultiplier = 1;
    let requiredUnitSales = product.currentMonthlySales || 10;
    if (simulated.netProfit <= 0) {
        breakEvenSalesMultiplier = Infinity; // Zararına satışta başa baş imkansız
        requiredUnitSales = Infinity;
    }
    else if (baseline.netProfit > 0) {
        breakEvenSalesMultiplier = Number((baseline.netProfit / simulated.netProfit).toFixed(2));
        requiredUnitSales = Math.ceil((product.currentMonthlySales || 10) * breakEvenSalesMultiplier);
    }
    // Risk ve Barem Analizi
    const warnings = [];
    const recommendations = [];
    let riskLevel = 'SAFE_PROFITABLE';
    // 1. Kritik Zarar Kontrolü
    if (simulated.netProfit < 0) {
        riskLevel = 'CRITICAL_LOSS';
        warnings.push(`🔴 DİKKAT: Ürün her satışta ${Math.abs(simulated.netProfit)} TL NET ZARAR yazmaktadır!`);
        recommendations.push(`Bu kampanyaya kesinlikle mevcut fiyatla katılmayın. Minimum karlı fiyat için liste fiyatını artırın.`);
    }
    // 2. Kargo Barem Tuzağı Kontrolü
    else if (baseline.price >= 200 && simulated.price < 200) {
        riskLevel = 'TRAP_SHIPPING_THRESHOLD';
        warnings.push(`⚠️ KARGO BAREM TUZAĞI: İndirimle fiyat 200 TL eşiğinin altına (${simulated.price} TL) düştü. Kargo barem baskısı ve kâr erimesi oluşuyor.`);
        recommendations.push(`Liste fiyatını ${Math.ceil(200 / (1 - ((campaign.discountPercent || 15) / 100)))} TL seviyesine çekerek kampanyaya girin.`);
    }
    // 3. Düşük Marj Kontrolü
    else if (simulated.marginPercent < 6) {
        riskLevel = 'WARNING_LOW_MARGIN';
        warnings.push(`🟡 DÜŞÜK KÂR MARJI: Net kâr marjı %${simulated.marginPercent} seviyesine geriledi (Kritik sınır: %6).`);
        recommendations.push(`İade oranı yüksek bir kategorideyseniz iade kargo maliyetleri kârınızı eksiye düşürebilir.`);
    }
    // 4. Mükemmel Durum
    else if (simulated.marginPercent >= 20 && profitDeltaPercent > -25) {
        riskLevel = 'EXCELLENT';
        recommendations.push(`🟢 Kampanyaya katılım için çok uygun. Yüksek marj (%${simulated.marginPercent}) hacim artışını kâra dönüştürecektir.`);
    }
    // Başa baş uyarısı
    if (breakEvenSalesMultiplier > 1.5 && simulated.netProfit > 0) {
        warnings.push(`📈 Toplam kârınızı korumak için satış adedini ${breakEvenSalesMultiplier}x katına (${requiredUnitSales} adede) çıkarmanız gerekir.`);
    }
    // Akıllı Danışman Tavsiyesi
    let smartAdvice = '';
    if (riskLevel === 'CRITICAL_LOSS') {
        smartAdvice = `Bu ürün kampanyada birim başına ${Math.abs(simulated.netProfit)} TL kaybettiriyor. Kampanyadan hariç tutun veya liste fiyatını en az ${(product.costPrice * 1.45).toFixed(0)} TL yapın.`;
    }
    else if (riskLevel === 'TRAP_SHIPPING_THRESHOLD') {
        smartAdvice = `İndirim sonrası fiyat ${simulated.price} TL oldu. 200 TL sınırını korumak için sepet indirimi yerine 2. Ürüne indirim modeli uygulayarak sepet tutarını artırın.`;
    }
    else if (riskLevel === 'WARNING_LOW_MARGIN') {
        smartAdvice = `Birim kâr ${simulated.netProfit} TL'ye indi. Satış adedini en az %${Math.round((breakEvenSalesMultiplier - 1) * 100)} artıramazsanız toplam kârınız azalacaktır.`;
    }
    else {
        smartAdvice = `Güvenli kampanya adayı. ${simulated.marginPercent}% marj ile pazar payı kazanmak için değerlendirilebilir.`;
    }
    return {
        product,
        campaign,
        baseline,
        simulated,
        profitDelta,
        profitDeltaPercent,
        marginDeltaPercent,
        breakEvenSalesMultiplier,
        requiredUnitSales,
        riskLevel,
        warnings,
        recommendations,
        smartAdvice
    };
}
/**
 * Bir kampanyayı mağazadaki TÜM ürünlere uygulayarak toplu sonuç ve özet çıkartır
 */
function simulateBatchCampaign(products, campaign) {
    const results = products.map(product => simulateProductCampaign(product, campaign));
    let profitableCount = 0;
    let warningCount = 0;
    let lossMakingCount = 0;
    let trapCount = 0;
    let totalBaselineProjectedProfit = 0;
    let totalSimulatedProjectedProfit = 0;
    results.forEach(res => {
        const monthlySales = res.product.currentMonthlySales || 10;
        totalBaselineProjectedProfit += res.baseline.netProfit * monthlySales;
        totalSimulatedProjectedProfit += res.simulated.netProfit * monthlySales;
        if (res.riskLevel === 'CRITICAL_LOSS') {
            lossMakingCount++;
        }
        else if (res.riskLevel === 'TRAP_SHIPPING_THRESHOLD') {
            trapCount++;
        }
        else if (res.riskLevel === 'WARNING_LOW_MARGIN') {
            warningCount++;
        }
        else {
            profitableCount++;
        }
    });
    const netProfitImpact = Number((totalSimulatedProjectedProfit - totalBaselineProjectedProfit).toFixed(2));
    return {
        campaign,
        totalProductsCount: products.length,
        profitableCount,
        warningCount,
        lossMakingCount,
        trapCount,
        totalBaselineProjectedProfit: Number(totalBaselineProjectedProfit.toFixed(2)),
        totalSimulatedProjectedProfit: Number(totalSimulatedProjectedProfit.toFixed(2)),
        netProfitImpact,
        results
    };
}
