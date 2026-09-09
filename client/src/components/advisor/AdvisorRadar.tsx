import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Truck, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  HelpCircle,
  Lightbulb,
  Sliders
} from 'lucide-react';
import { fetchInsights } from '../../services/api.js';
import { Product } from '../../types/index.js';

interface AdvisorRadarProps {
  onOpenInPlayground: (product: Product) => void;
}

export const AdvisorRadar: React.FC<AdvisorRadarProps> = ({ onOpenInPlayground }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchInsights();
        setInsights(data);
      } catch (err) {
        console.error('Insights yüklenemedi:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !insights) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs">Mağaza geneli risk ve kargo barem tuzakları taranıyor...</p>
      </div>
    );
  }

  const baremRisks = insights.baremRisks || [];
  const lossRisks = insights.lossRisks || [];
  const topOpportunities = insights.topOpportunities || [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                Akıllı Kârlılık Radarı
              </span>
              <span className="text-slate-400 text-xs font-medium">Barem & Zarar Koruma Sistemi</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1 tracking-tight">
              Pazaryeri Kampanya Tuzakları ve Fırsat Radarı
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              Türkiye pazaryerlerinde satıcıların en çok zarar ettiği kargo baremi düşüşleri ve komisyon yanılsamaları otomatik olarak tespit edildi.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Main Alert Columns / Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Kargo Barem Tuzakları */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Kargo Barem Tuzağı Riskleri</h3>
            </div>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold">
              {baremRisks.length} Riskli Ürün
            </span>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200 leading-relaxed">
            💡 <strong>Barem Tuzağı Nedir?</strong> Ürününüz normalde 200 TL üzerinde satılırken kampanyayla 180-195 TL bandına indiğinde, normalde alıcının ödediği veya barem desteği olan kargo satıcının kârından erir ve kâr marjınız sıfırlanabilir.
          </div>

          <div className="space-y-3">
            {baremRisks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Barem tuzağına düşen ürün bulunamadı. Harika!</p>
            ) : (
              baremRisks.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{item.product.title}</p>
                      <span className="text-[10px] text-slate-400">{item.product.sku} | {item.campaign.title}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 whitespace-nowrap">{item.dropPrice} TL</span>
                  </div>

                  <p className="text-[11px] text-amber-300/90 font-medium">
                    {item.issue}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Tavsiye: Liste fiyatını {Math.ceil(200 / (1 - (item.campaign.discountPercent || 15) / 100))} TL yapın.
                    </span>
                    <button
                      onClick={() => onOpenInPlayground(item.product)}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 rounded text-[11px] font-semibold transition"
                    >
                      Simüle Et
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Zararına Satış Alarmları */}
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-bold text-white">Zararına Satış Alarmları</h3>
            </div>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full text-xs font-bold">
              {lossRisks.length} Kritik Ürün
            </span>
          </div>

          <div className="bg-red-950/20 border border-red-500/20 p-3 rounded-xl text-xs text-red-200 leading-relaxed">
            🔴 <strong>Kritik Zarar:</strong> Kampanya indirimi, komisyon ve alış maliyeti toplandığında satış fiyatını aşmakta ve her siparişte net para kaybettirmektedir.
          </div>

          <div className="space-y-3">
            {lossRisks.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Zararına satış yapan ürün bulunamadı. Çok iyi!</p>
            ) : (
              lossRisks.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-950/80 border border-red-900/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{item.product.title}</p>
                      <span className="text-[10px] text-slate-400">{item.product.sku} | {item.campaign.title}</span>
                    </div>
                    <span className="text-xs font-bold text-red-400 whitespace-nowrap">
                      -{item.lossAmount} TL Zarar / Adet
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Alış Maliyeti: {item.product.costPrice} TL | Kampanyalı Fiyat: {item.product.listingPrice * (1 - (item.campaign.discountPercent || 15) / 100)} TL
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-red-300 font-semibold">
                      Aksiyon: Bu ürünü kampanyadan derhal çıkarın!
                    </span>
                    <button
                      onClick={() => onOpenInPlayground(item.product)}
                      className="px-2 py-1 bg-red-500/20 hover:bg-red-500 hover:text-white text-red-300 rounded text-[11px] font-semibold transition"
                    >
                      Düzelt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 3. Yüksek Fırsat & Başarılı Kampanya Adayları */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Yüksek Kârlı Kampanya Fırsatları</h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">Hacimle Büyüyebilecek Ürünler</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topOpportunities.map((item: any, idx: number) => (
            <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{item.product.title}</p>
                <span className="text-[10px] text-slate-400">{item.campaign.title}</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs font-bold text-emerald-400">+{item.profit.toFixed(2)} TL Net Kâr</span>
                  <span className="text-[10px] text-slate-500">Marj: %{item.margin}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenInPlayground(item.product)}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 rounded-lg text-xs font-semibold transition shrink-0"
              >
                İncele
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
