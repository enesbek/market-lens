export interface TaxBreakdown {
  grossSalePrice: number;       // Satış Fiyatı (KDV Dahil)
  netSalePriceExclVat: number;  // Satış Matrahı (KDV Hariç)
  saleVatAmount: number;        // Satıştan Doğan KDV (Devlete Borç)
  
  cogsVatAmount: number;        // Alış Maliyetindeki KDV (İndirilecek KDV)
  commissionVatAmount: number;  // Pazaryeri Komisyon Faturasındaki KDV (%20)
  shippingVatAmount: number;    // Kargo Faturasındaki KDV (%20)
  
  totalDeductibleVat: number;   // Toplam İndirilebilir KDV
  netVatPayable: number;        // Devlete Ödenecek Net KDV Farkı
  stopajWithholding: number;    // Pazaryerinin kestiği %1 stopaj
}

/**
 * Türkiye Vergi ve KDV Mevzuatına Göre Detaylı KDV / Stopaj Hesaplaması
 */
export function calculateTaxes(
  salePriceInclVat: number,
  costPrice: number,
  saleVatRate: number = 20,
  costVatRate: number = 20,
  commissionAmountInclVat: number = 0,
  shippingFeeInclVat: number = 0
): TaxBreakdown {
  // 1. Satış KDV'si
  const netSalePriceExclVat = salePriceInclVat / (1 + (saleVatRate / 100));
  const saleVatAmount = salePriceInclVat - netSalePriceExclVat;

  // 2. Alış KDV'si (Girdi KDV)
  // Maliyet KDV dahil kabul edilirse içindeki KDV ayrıştırılır
  const cogsExclVat = costPrice / (1 + (costVatRate / 100));
  const cogsVatAmount = costPrice - cogsExclVat;

  // 3. Komisyon faturası KDV'si (Genel oranda %20 KDV içerir)
  const commissionVatAmount = commissionAmountInclVat - (commissionAmountInclVat / 1.20);

  // 4. Kargo faturası KDV'si (Genel oranda %20 KDV içerir)
  const shippingVatAmount = shippingFeeInclVat - (shippingFeeInclVat / 1.20);

  // 5. Toplam İndirilecek KDV
  const totalDeductibleVat = cogsVatAmount + commissionVatAmount + shippingVatAmount;

  // 6. Net Ödenecek KDV (Pozitifse devlete ödenir, negatifse devreden KDV oluşur)
  const netVatPayable = Math.max(0, saleVatAmount - totalDeductibleVat);

  // 7. Pazaryeri Stopaj Kesintisi (KDV Hariç Tutarın %1'i)
  const stopajWithholding = Number((netSalePriceExclVat * 0.01).toFixed(2));

  return {
    grossSalePrice: Number(salePriceInclVat.toFixed(2)),
    netSalePriceExclVat: Number(netSalePriceExclVat.toFixed(2)),
    saleVatAmount: Number(saleVatAmount.toFixed(2)),
    cogsVatAmount: Number(cogsVatAmount.toFixed(2)),
    commissionVatAmount: Number(commissionVatAmount.toFixed(2)),
    shippingVatAmount: Number(shippingVatAmount.toFixed(2)),
    totalDeductibleVat: Number(totalDeductibleVat.toFixed(2)),
    netVatPayable: Number(netVatPayable.toFixed(2)),
    stopajWithholding
  };
}
