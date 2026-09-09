import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  Truck, 
  Percent, 
  Package, 
  Info,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Product, CampaignType, MarketplaceType, SimulationResult } from '../../types/index.js';
import { simulatePlayground } from '../../services/api.js';

interface LivePlaygroundProps {
  products: Product[];
  selectedProduct?: Product | null;
  onClearSelectedProduct?: () => void;
}

export const LivePlayground: React.FC<LivePlaygroundProps> = ({
  products,
  selectedProduct,
  onClearSelectedProduct
}) => {
  // Input States
  const [selectedProductId, setSelectedProductId] = useState<string>(selectedProduct ? selectedProduct.id : '');
  const [marketplace, setMarketplace] = useState<MarketplaceType>('trendyol');
  const [category, setCategory] = useState<string>('Kadın Giyim & Moda');
  const [listingPrice, setListingPrice] = useState<number>(249.90);
  const [costPrice, setCostPrice] = useState<number>(85.00);
  const [desi, setDesi] = useState<number>(1.0);
  const [currentMonthlySales, setCurrentMonthlySales] = useState<number>(100);
  
  // Campaign States
  const [campaignType, setCampaignType] = useState<CampaignType>('cart_percent');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [fixedDiscountAmount, setFixedDiscountAmount] = useState<number>(50);
  const [minCartAmount, setMinCartAmount] = useState<number>(300);
  const [platformContributionPercent, setPlatformContributionPercent] = useState<number>(50);

  // Result State
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // If selectedProduct changes from props, update form
  useEffect(() => {
    if (selectedProduct) {
      setSelectedProductId(selectedProduct.id);
      setMarketplace(selectedProduct.marketplace);
      setCategory(selectedProduct.category);
      setListingPrice(selectedProduct.listingPrice);
      setCostPrice(selectedProduct.costPrice);
      setDesi(selectedProduct.desi);
      setCurrentMonthlySales(selectedProduct.currentMonthlySales || 50);
    }
  }, [selectedProduct]);

  // Handle Preset Product Select
  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    if (!id) {
      if (onClearSelectedProduct) onClearSelectedProduct();
      return;
    }
    const found = products.find(p => p.id === id);
    if (found) {
      setMarketplace(found.marketplace);
      setCategory(found.category);
      setListingPrice(found.listingPrice);
      setCostPrice(found.costPrice);
      setDesi(found.desi);
      setCurrentMonthlySales(found.currentMonthlySales || 50);
    }
  };

  // Re-calculate simulation on any parameter change
  useEffect(() => {
    const runSim = async () => {
      setLoading(true);
      try {
        const res = await simulatePlayground({
          listingPrice,
          costPrice,
          category,
          marketplace,
          desi,
          campaignType,
          discountPercent,
          fixedDiscountAmount,
          minCartAmount,
          platformContributionPercent,
          currentMonthlySales
        });
        setSimResult(res);
      } catch (err) {
        console.error('Simülasyon hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(runSim, 150);
    return () => clearTimeout(timer);
  }, [
    listingPrice,
    costPrice,
    category,
    marketplace,
    desi,
    campaignType,
    discountPercent,
    fixedDiscountAmount,
    minCartAmount,
    platformContributionPercent,
    currentMonthlySales
  ]);

  const categories = [
    'Kadın Giyim & Moda',
    'Erkek Giyim & Moda',
    'Ayakkabı & Çanta',
    'Kozmetik & Kişisel Bakım',
    'Elektronik Aksesuar & Kulaklık',
    'Bilgisayar & Donanım',
    'Ev & Mutfak / Dekorasyon',
    'Anne & Bebek',
    'Spor & Outdoor',
    'Oto Aksesuar & Hırdavat',
    'Gıda & Süpermarket'
  ];

  const baselineMonthlyProfit = simResult ? (simResult.baseline.netProfit * currentMonthlySales) : 0;
  const simulatedMonthlyProfit = simResult ? (simResult.simulated.netProfit * currentMonthlySales) : 0;
  const monthlyProfitDiff = simulatedMonthlyProfit - baselineMonthlyProfit;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Canlı What-If Hesaplayıcı
              </span>
              <span className="text-slate-400 text-xs font-medium">Birim İktisadı (Unit Economics)</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">
              Pazaryeri Kampanya Kârlılık & Barem Simülatörü
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              Fiyat, komisyon, desi kargo baremi ve vergi kesintilerinin kampanya sonrasındaki gerçek net kârınızı nasıl etkilediğini canlı olarak görün.
            </p>
          </div>

          {/* Quick Product Preset Selector */}
          <div className="flex items-center space-x-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <Package className="w-4 h-4 text-orange-400" />
            <div className="text-left">
              <label className="block text-[10px] text-slate-400 font-medium uppercase">Katalogdan Ürün Yükle</label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-300">Özel Değerler Gir (Serbest Mod)</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.marketplace.toUpperCase()} - {p.title.substring(0, 32)}... ({p.listingPrice} TL)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Real-time Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input Parameters Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* 1. Ürün & Mağaza Bilgileri */}
          <div className="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Package className="w-4 h-4 text-orange-400" />
                <span>1. Ürün & Mağaza Parametreleri</span>
              </h3>
              <span className="text-[11px] text-slate-400">Temel Bilgiler</span>
            </div>

            {/* Pazaryeri Seçimi */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Pazaryeri</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMarketplace('trendyol')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition ${
                    marketplace === 'trendyol'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-sm'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span>Trendyol</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMarketplace('hepsiburada')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition ${
                    marketplace === 'hepsiburada'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Hepsiburada</span>
                </button>
              </div>
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Ürün Kategorisi</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Fiyat & Maliyet */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Satış Fiyatı (TL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500 font-medium">TL</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Alış Maliyeti (COGS)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-500 font-medium">TL</span>
                </div>
              </div>
            </div>

            {/* Desi & Aylık Satış Hacmi */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Kargo Desi</span>
                  <span className="text-[10px] text-orange-400">{desi} Desi</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={desi}
                  onChange={(e) => setDesi(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Aylık Satış</span>
                  <span className="text-[10px] text-slate-400">{currentMonthlySales} Adet</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={currentMonthlySales}
                  onChange={(e) => setCurrentMonthlySales(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

          </div>

          {/* 2. Kampanya Türü ve Koşulları */}
          <div className="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>2. Kampanya Türü & İndirim Yapısı</span>
              </h3>
              <span className="text-[11px] text-slate-400">What-If Ayarları</span>
            </div>

            {/* Kampanya Modeli Seçimi */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Kampanya Formatı</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCampaignType('cart_percent')}
                  className={`p-2 rounded-xl text-left border transition ${
                    campaignType === 'cart_percent'
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-semibold">Sepette % İndirim</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Örn: Sepette %15 İndirim</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCampaignType('flash_deal')}
                  className={`p-2 rounded-xl text-left border transition ${
                    campaignType === 'flash_deal'
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-semibold">Flaş / Süper Fiyat</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Doğrudan Fiyat Kırma</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCampaignType('cart_fixed_over_limit')}
                  className={`p-2 rounded-xl text-left border transition ${
                    campaignType === 'cart_fixed_over_limit'
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-semibold">Baremli İndirim</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">500 TL üzeri 75 TL</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCampaignType('second_item_discount')}
                  className={`p-2 rounded-xl text-left border transition ${
                    campaignType === 'second_item_discount'
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-semibold">2. Ürüne %50 İndirim</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Çok Al Az Öde</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCampaignType('platform_coupon')}
                  className={`col-span-2 p-2 rounded-xl text-left border transition ${
                    campaignType === 'platform_coupon'
                      ? 'bg-orange-500/20 border-orange-500 text-white'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-semibold">Platform Destekli Kupon (Ortak Karşılama)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pazaryeri indirimin belirli bir yüzdesini sübvanse eder</p>
                </button>
              </div>
            </div>

            {/* Dinamik Değer Ayarlayıcılar */}
            {(campaignType === 'cart_percent' || campaignType === 'flash_deal') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">İndirim Oranı</span>
                  <span className="font-bold text-orange-400 text-sm">%{discountPercent}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>%5 (Hafif)</span>
                  <span>%15 (Standart)</span>
                  <span>%25 (Agresif)</span>
                  <span>%50 (Flaş)</span>
                </div>
              </div>
            )}

            {campaignType === 'cart_fixed_over_limit' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Sepet Alt Limiti (TL)</label>
                  <input
                    type="number"
                    value={minCartAmount}
                    onChange={(e) => setMinCartAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">İndirim Tutarı (TL)</label>
                  <input
                    type="number"
                    value={fixedDiscountAmount}
                    onChange={(e) => setFixedDiscountAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            {campaignType === 'platform_coupon' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Kupon Tutarı (TL)</label>
                    <input
                      type="number"
                      value={fixedDiscountAmount}
                      onChange={(e) => setFixedDiscountAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Min. Sepet (TL)</label>
                    <input
                      type="number"
                      value={minCartAmount}
                      onChange={(e) => setMinCartAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-300">Pazaryeri Karşılama Payı</span>
                    <span className="font-semibold text-emerald-400">%{platformContributionPercent} Pazaryeri / %{100 - platformContributionPercent} Satıcı</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={platformContributionPercent}
                    onChange={(e) => setPlatformContributionPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Real-Time Results & Financial Impact (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {simResult && (
            <>
              {/* Alert / Risk Card Banner */}
              <div className={`p-4 rounded-2xl border transition-all ${
                simResult.riskLevel === 'CRITICAL_LOSS'
                  ? 'bg-red-950/40 border-red-500/50 text-red-200'
                  : simResult.riskLevel === 'TRAP_SHIPPING_THRESHOLD'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : simResult.riskLevel === 'WARNING_LOW_MARGIN'
                  ? 'bg-yellow-950/40 border-yellow-500/50 text-yellow-200'
                  : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {simResult.riskLevel === 'CRITICAL_LOSS' && <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />}
                  {simResult.riskLevel === 'TRAP_SHIPPING_THRESHOLD' && <Truck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />}
                  {simResult.riskLevel === 'WARNING_LOW_MARGIN' && <Info className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />}
                  {(simResult.riskLevel === 'SAFE_PROFITABLE' || simResult.riskLevel === 'EXCELLENT') && <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />}
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm">
                        {simResult.riskLevel === 'CRITICAL_LOSS' && 'ZARARINA SATIŞ ALARMI!'}
                        {simResult.riskLevel === 'TRAP_SHIPPING_THRESHOLD' && 'KARGO BAREM TUZAĞI TESPİT EDİLDİ'}
                        {simResult.riskLevel === 'WARNING_LOW_MARGIN' && 'KRİTİK DÜŞÜK KÂR MARJI UYARISI'}
                        {simResult.riskLevel === 'EXCELLENT' && 'MÜKEMMEL KAMPANYA FIRSATI'}
                        {simResult.riskLevel === 'SAFE_PROFITABLE' && 'GÜVENLİ VE KÂRLI KAMPANYA'}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed font-medium">
                      {simResult.smartAdvice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison KPIs */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Normal Satış (Baseline) */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kampanya Öncesi</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-700/50 rounded text-slate-300 font-medium">Normal Satış</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400">Müşteri Satış Fiyatı</span>
                    <p className="text-lg font-bold text-white">{simResult.baseline.price.toFixed(2)} TL</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/40">
                    <div>
                      <span className="text-[10px] text-slate-400">Birim Net Kâr</span>
                      <p className="text-base font-bold text-emerald-400">+{simResult.baseline.netProfit.toFixed(2)} TL</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Net Kâr Marjı</span>
                      <p className="text-base font-bold text-slate-200">%{simResult.baseline.marginPercent}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Komisyon ({simResult.baseline.commissionRate}%)</span>
                      <span>-{simResult.baseline.commissionAmount.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Kargo ({simResult.baseline.desi} Desi)</span>
                      <span>-{simResult.baseline.shippingFee.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Hizmet & Stopaj</span>
                      <span>-{(simResult.baseline.serviceFee + simResult.baseline.stopajWithholding).toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Ürün Maliyeti (COGS)</span>
                      <span>-{simResult.baseline.cogs.toFixed(2)} TL</span>
                    </div>
                  </div>
                </div>

                {/* Kampanyalı Durum (Simulated) */}
                <div className={`border rounded-2xl p-4 space-y-3 ${
                  simResult.simulated.netProfit < 0
                    ? 'bg-red-950/20 border-red-500/40'
                    : 'bg-orange-950/20 border-orange-500/40'
                }`}>
                  <div className="flex items-center justify-between border-b border-orange-500/20 pb-2">
                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Kampanya Sonrası</span>
                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded font-bold">Simüle Edilen</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">Kampanyalı Fiyat</span>
                      <p className="text-lg font-bold text-white">{simResult.simulated.price.toFixed(2)} TL</p>
                    </div>
                    <span className="text-xs font-bold text-orange-400">-{simResult.simulated.discountAmount.toFixed(2)} TL İndirim</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-orange-500/20">
                    <div>
                      <span className="text-[10px] text-slate-400">Birim Net Kâr</span>
                      <p className={`text-base font-bold ${
                        simResult.simulated.netProfit < 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {simResult.simulated.netProfit >= 0 ? '+' : ''}{simResult.simulated.netProfit.toFixed(2)} TL
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Net Kâr Marjı</span>
                      <p className={`text-base font-bold ${
                        simResult.simulated.marginPercent < 6 ? 'text-amber-400' : 'text-slate-200'
                      }`}>
                        %{simResult.simulated.marginPercent}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl text-xs space-y-1 border border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>Komisyon ({simResult.simulated.commissionRate}%)</span>
                      <span>-{simResult.simulated.commissionAmount.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Kargo ({simResult.simulated.desi} Desi)</span>
                      <span>-{simResult.simulated.shippingFee.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Hizmet & Stopaj</span>
                      <span>-{(simResult.simulated.serviceFee + simResult.simulated.stopajWithholding).toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Ürün Maliyeti (COGS)</span>
                      <span>-{simResult.simulated.cogs.toFixed(2)} TL</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Elasticity & Break-Even Metric Box */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Başa Baş (Break-Even) Satış Esnekliği
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Aylık Kâr Koruma Hedefi</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400">Birim Kâr Değişimi</span>
                    <p className={`text-base font-bold mt-0.5 ${simResult.profitDelta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {simResult.profitDelta >= 0 ? '+' : ''}{simResult.profitDelta.toFixed(2)} TL ({simResult.profitDeltaPercent}%)
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400">Gereken Satış Artışı</span>
                    <p className="text-base font-bold text-orange-400 mt-0.5">
                      {simResult.breakEvenSalesMultiplier === Infinity ? (
                        <span className="text-red-400 font-bold">İmkansız (Zarar)</span>
                      ) : (
                        `${simResult.breakEvenSalesMultiplier}x Katına Çıkmalı`
                      )}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400">Hedef Satış Adedi</span>
                    <p className="text-base font-bold text-white mt-0.5">
                      {simResult.requiredUnitSales === Infinity ? '—' : `${simResult.requiredUnitSales} Adet / Ay`}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  💡 <strong>Açıklama:</strong> Normalde ayda {currentMonthlySales} adet satarak toplam {baselineMonthlyProfit.toLocaleString('tr-TR')} TL kâr ediyordunuz. 
                  Bu indirimde birim kârınız azaldığı için, aynı {baselineMonthlyProfit.toLocaleString('tr-TR')} TL toplam kârı yakalamak adına satış adedinizi 
                  {simResult.requiredUnitSales === Infinity ? ' artıramazsınız çünkü ürün zarar yazıyor.' : ` en az ${simResult.requiredUnitSales} adede ulaştırmalısınız.`}
                </p>
              </div>

              {/* Financial Deductions Visual Breakdown Bar */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-slate-300">100 TL Satış Gelirinin Dağılımı (Kampanyalı)</h4>
                  <span className="text-[11px] text-slate-400">Birim Gelir Kırılımı</span>
                </div>

                {/* Multi-segment Progress Bar */}
                {simResult.simulated.price > 0 && (
                  <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                      style={{ width: `${Math.max(0, (simResult.simulated.cogs / simResult.simulated.price) * 100)}%` }} 
                      className="bg-blue-500 h-full" 
                      title={`Maliyet: ${simResult.simulated.cogs} TL`}
                    />
                    <div 
                      style={{ width: `${Math.max(0, (simResult.simulated.commissionAmount / simResult.simulated.price) * 100)}%` }} 
                      className="bg-orange-500 h-full" 
                      title={`Komisyon: ${simResult.simulated.commissionAmount} TL`}
                    />
                    <div 
                      style={{ width: `${Math.max(0, (simResult.simulated.shippingFee / simResult.simulated.price) * 100)}%` }} 
                      className="bg-purple-500 h-full" 
                      title={`Kargo: ${simResult.simulated.shippingFee} TL`}
                    />
                    <div 
                      style={{ width: `${Math.max(0, ((simResult.simulated.serviceFee + simResult.simulated.stopajWithholding + simResult.simulated.netVatPayable) / simResult.simulated.price) * 100)}%` }} 
                      className="bg-slate-500 h-full" 
                      title={`Hizmet & Vergi: ${(simResult.simulated.serviceFee + simResult.simulated.stopajWithholding).toFixed(2)} TL`}
                    />
                    {simResult.simulated.netProfit > 0 && (
                      <div 
                        style={{ width: `${Math.max(0, (simResult.simulated.netProfit / simResult.simulated.price) * 100)}%` }} 
                        className="bg-emerald-500 h-full" 
                        title={`Net Kâr: ${simResult.simulated.netProfit} TL`}
                      />
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
                    <span>Ürün Maliyeti (%{((simResult.simulated.cogs / simResult.simulated.price) * 100).toFixed(0)})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-orange-500 inline-block"></span>
                    <span>Pazaryeri Komisyonu (%{((simResult.simulated.commissionAmount / simResult.simulated.price) * 100).toFixed(0)})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block"></span>
                    <span>Kargo Bedeli (%{((simResult.simulated.shippingFee / simResult.simulated.price) * 100).toFixed(0)})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-500 inline-block"></span>
                    <span>Hizmet & Vergi</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                    <span className="font-semibold text-emerald-400">Net Kâr (%{simResult.simulated.marginPercent})</span>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
};
