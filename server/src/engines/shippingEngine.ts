import { MarketplaceType } from '../types/index.js';

export interface ShippingCostBreakdown {
  shippingFee: number;                  // Satıcıya yansıyan kargo bedeli (KDV Dahil TL)
  shippingPayer: 'seller' | 'buyer';    // Kargo satıcıya mı ait alıcıya mı?
  thresholdAmount: number;              // Barem eşiği (örn: 200 TL)
  isThresholdPassed: boolean;           // Fiyat baremi geçti mi?
  isBaremLossRisk: boolean;             // Kampanya sonrası barem altına inip kargo satıcıya ek yük getirdi mi?
  desiTierName: string;
}

// Standart Anlaşmalı Kargo Fiyat Tarifesi (Trendyol Express / HepsiJet / Yurtiçi Kargo Entegrasyonu 2024-2026)
export const SHIPPING_RATES: { minDesi: number; maxDesi: number; fee: number; tierName: string }[] = [
  { minDesi: 0, maxDesi: 1.0, fee: 54.00, tierName: '0 - 1 Desi (Mikro Paket)' },
  { minDesi: 1.01, maxDesi: 2.99, fee: 68.50, tierName: '2 - 3 Desi (Küçük Paket)' },
  { minDesi: 3.0, maxDesi: 5.99, fee: 82.00, tierName: '4 - 5 Desi (Orta Paket)' },
  { minDesi: 6.0, maxDesi: 10.99, fee: 115.00, tierName: '6 - 10 Desi (Büyük Paket)' },
  { minDesi: 11.0, maxDesi: 15.99, fee: 165.00, tierName: '11 - 15 Desi (Çok Büyük)' },
  { minDesi: 16.0, maxDesi: 20.99, fee: 220.00, tierName: '16 - 20 Desi (Koli)' },
  { minDesi: 21.0, maxDesi: 999.0, fee: 280.00, tierName: '21+ Desi (Ağır Yük)' },
];

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 200.0; // 200 TL ve üzeri siparişlerde kargo satıcıya aittir

/**
 * Ürünün desi ve fiyatına göre satıcıya yansıyan kargo bedelini hesaplar.
 * Türkiye pazaryerlerinde kural:
 * - Sepet/Ürün Fiyatı >= Barem Eşiği (200 TL): Kargo bedava taahhüdü vardır, satıcı tam kargo bedelini öder.
 * - Sepet/Ürün Fiyatı < Barem Eşiği (200 TL): Müşteri kargoyu öder. Satıcıya genelde 0 TL veya küçük platform işlem payı kalır.
 * 
 * TEHLİKELİ SENARYO (Barem Tuzağı):
 * Eğer ürün fiyatı 210 TL ise satıcı 68.50 TL kargo ödüyordu ve kârı buna göre ayarlıydı.
 * %10 indirimle fiyat 189 TL'ye düştüğünde, müşteri kargo ödemek zorunda kalabilir ve sepet terk oranı fırlar VEYA
 * Satıcı 'Kargo Bedava' etiketini korumak için kendisi ödemeye devam ederse indirim + kargo ile kârı yok olur!
 */
export function calculateShipping(
  desi: number,
  finalPrice: number,
  _marketplace: MarketplaceType,
  threshold: number = DEFAULT_FREE_SHIPPING_THRESHOLD,
  sellerForceFreeShipping: boolean = true // Çoğu rekabetçi satıcı ücretsiz kargo sunar
): ShippingCostBreakdown {
  // Desi aralığını bul
  const tier = SHIPPING_RATES.find(t => desi >= t.minDesi && desi <= t.maxDesi) || SHIPPING_RATES[0];
  let baseFee = tier.fee;
  
  if (desi > 20) {
    const extraDesi = Math.ceil(desi - 20);
    baseFee += extraDesi * 8.5; // Ekstra her desi başına 8.5 TL
  }

  const isThresholdPassed = finalPrice >= threshold;
  
  // Eğer fiyat eşiğin üzerindeyse veya satıcı koşulsuz ücretsiz kargo veriyorsa satıcı öder
  let shippingFee = baseFee;
  let shippingPayer: 'seller' | 'buyer' = 'seller';

  if (!isThresholdPassed && !sellerForceFreeShipping) {
    // Alıcı öder kuralında satıcı maliyeti 0
    shippingFee = 0;
    shippingPayer = 'buyer';
  } else {
    shippingFee = baseFee;
    shippingPayer = 'seller';
  }

  return {
    shippingFee,
    shippingPayer,
    thresholdAmount: threshold,
    isThresholdPassed,
    isBaremLossRisk: finalPrice < threshold && finalPrice > (threshold * 0.75),
    desiTierName: tier.tierName
  };
}
