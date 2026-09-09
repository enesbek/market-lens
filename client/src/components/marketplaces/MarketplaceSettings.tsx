import React, { useState, useEffect } from 'react';
import { 
  Store, 
  CheckCircle, 
  RefreshCw, 
  ShieldCheck, 
  Truck, 
  Percent, 
  Key, 
  Info,
  Server
} from 'lucide-react';
import { fetchMarketplaces, syncMarketplace } from '../../services/api.js';

export const MarketplaceSettings: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [syncing, setSyncing] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchMarketplaces();
      setData(res);
    } catch (err) {
      console.error('Pazaryeri verisi yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSync = async (mpName?: string) => {
    setSyncing(true);
    try {
      const res = await syncMarketplace(mpName);
      setSyncMessage(res.message);
      setTimeout(() => setSyncMessage(''), 4000);
      load();
    } catch (err) {
      console.error('Senkronizasyon hatası:', err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs">Pazaryeri entegrasyonları ve komisyon tarifeleri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              API Entegrasyon & Tarife Havuzu
            </span>
            <span className="text-slate-400 text-xs font-medium">2 Aktif Pazaryeri</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1 tracking-tight">
            Pazaryeri Entegrasyonları ve Komisyon Matrisi
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl">
            Trendyol ve Hepsiburada API bağlantı durumu, kategori bazlı güncel komisyon kesintileri ve desi bazlı anlaşmalı kargo baremleri.
          </p>
        </div>

        <button
          onClick={() => handleSync()}
          disabled={syncing}
          className="flex items-center space-x-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-500/20 transition"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Senkronize Ediliyor...' : 'Tüm Pazaryerlerini Güncelle'}</span>
        </button>
      </div>

      {syncMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Connected Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.accounts.map((acc: any) => (
          <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className={`w-3 h-3 rounded-full ${acc.marketplace === 'trendyol' ? 'bg-orange-500' : 'bg-amber-500'}`}></span>
                <h3 className="text-sm font-bold text-white">{acc.name}</h3>
              </div>
              <span className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" />
                <span>Bağlı (Canlı)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Satıcı ID</span>
                <span className="text-slate-200 font-mono font-medium">{acc.supplierId || acc.merchantId}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Son Senkronizasyon</span>
                <span className="text-slate-200">{acc.lastSync}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Aktif Ürün Sayısı</span>
                <span className="text-white font-bold">{acc.activeProductsCount} Ürün</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Mağaza Sağlık Skoru</span>
                <span className="text-emerald-400 font-bold">{acc.healthScore}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSync(acc.name)}
                className="text-xs text-orange-400 hover:text-orange-300 font-medium transition flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Tekrar Senkronize Et</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2 Tables: Commission Matrix & Shipping Desi Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Commission Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Kategori Komisyon Oranları</h3>
            </div>
            <span className="text-[11px] text-slate-400">Pazaryeri Resmi Tarifesi</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-4">Kategori Adı</th>
                  <th className="py-2.5 px-4">Pazaryeri</th>
                  <th className="py-2.5 px-4">Komisyon %</th>
                  <th className="py-2.5 px-4">Hizmet Bedeli</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.commissionRates.map((cr: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-4 text-slate-200 font-medium">{cr.category}</td>
                    <td className="py-2.5 px-4">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        cr.marketplace === 'trendyol' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-600/20 text-amber-300'
                      }`}>
                        {cr.marketplace}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-orange-400">%{cr.commissionRate}</td>
                    <td className="py-2.5 px-4 text-slate-400">{cr.serviceFee} TL / Ürün</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipping Rates & Barem Info (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Kargo & Desi Baremleri</h3>
            </div>
            <span className="text-[11px] text-purple-400 font-semibold">200 TL Barem Eşiği</span>
          </div>

          <div className="px-4 text-xs text-slate-400 leading-relaxed">
            Ürün fiyatı <strong>200 TL ve üzeri</strong> olduğunda kargo satıcıya aittir ve aşağıdaki desi baremleri düşülür:
          </div>

          <div className="overflow-x-auto px-4 pb-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase">
                <tr>
                  <th className="py-2">Desi Aralığı</th>
                  <th className="py-2 text-right">Kargo Bedeli (KDV Dahil)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.shippingTiers.map((st: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 text-slate-300">{st.tierName}</td>
                    <td className="py-2 text-right font-mono font-bold text-purple-400">{st.fee.toFixed(2)} TL</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
