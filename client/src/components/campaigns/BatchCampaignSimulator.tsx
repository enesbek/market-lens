import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Truck, 
  Download, 
  Filter, 
  Search, 
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Tag,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';
import { Campaign, BatchSimulationSummary, SimulationResult, MarketplaceType, Product } from '../../types/index.js';
import { fetchCampaigns, simulateBatch } from '../../services/api.js';

interface BatchCampaignSimulatorProps {
  onOpenInPlayground?: (product: Product) => void;
  filterMarketplace?: MarketplaceType | 'all';
}

export const BatchCampaignSimulator: React.FC<BatchCampaignSimulatorProps> = ({
  onOpenInPlayground,
  filterMarketplace = 'all'
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [batchResult, setBatchResult] = useState<BatchSimulationSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'profitable' | 'trap' | 'loss' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load Campaigns
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCampaigns();
        setCampaigns(data);
        if (data.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(data[0].id);
        }
      } catch (err) {
        console.error('Kampanyalar yüklenemedi:', err);
      }
    };
    load();
  }, []);

  // Run Batch Simulation when campaign changes
  useEffect(() => {
    if (!selectedCampaignId) return;

    const run = async () => {
      setLoading(true);
      try {
        const res = await simulateBatch({
          campaignId: selectedCampaignId,
          marketplaceFilter: filterMarketplace !== 'all' ? filterMarketplace : undefined
        });
        setBatchResult(res);
      } catch (err) {
        console.error('Toplu simülasyon hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [selectedCampaignId, filterMarketplace]);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Filter results
  const filteredResults = batchResult?.results.filter(res => {
    const matchesSearch = 
      res.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.product.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'profitable') return res.riskLevel === 'SAFE_PROFITABLE' || res.riskLevel === 'EXCELLENT';
    if (statusFilter === 'trap') return res.riskLevel === 'TRAP_SHIPPING_THRESHOLD';
    if (statusFilter === 'loss') return res.riskLevel === 'CRITICAL_LOSS';
    if (statusFilter === 'warning') return res.riskLevel === 'WARNING_LOW_MARGIN';
    return true;
  }) || [];

  // Export CSV
  const handleExportCSV = () => {
    if (!batchResult) return;
    const headers = ['Ürün Adı', 'SKU', 'Kategori', 'Desi', 'Eski Fiyat', 'Yeni Fiyat', 'Eski Net Kâr', 'Yeni Net Kâr', 'Kâr Farkı', 'Yeni Marj %', 'Başa Baş Çarpanı', 'Risk Durumu'];
    const rows = filteredResults.map(r => [
      `"${r.product.title.replace(/"/g, '""')}"`,
      r.product.sku,
      `"${r.product.category}"`,
      r.product.desi,
      r.baseline.price,
      r.simulated.price,
      r.baseline.netProfit,
      r.simulated.netProfit,
      r.profitDelta,
      `%${r.simulated.marginPercent}`,
      r.breakEvenSalesMultiplier === Infinity ? 'İmkansız (Zarar)' : `${r.breakEvenSalesMultiplier}x`,
      r.riskLevel
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kampanya_Simulasyon_${selectedCampaign?.title.substring(0, 20)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Toplu Envanter Analiz Motoru
              </span>
              <span className="text-slate-400 text-xs font-medium">Katalog Geneli Kârlılık Simülasyonu</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1 tracking-tight">
              Pazaryeri Kampanya Etki & Barem Taraması
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              Trendyol veya Hepsiburada'da açılan bir kampanyayı seçin; mağazanızdaki tüm ürünlerin kârlılığını, zarara girenleri ve kargo barem tuzaklarını tek ekranda görün.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              disabled={!batchResult}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Simülasyonu CSV İndir</span>
            </button>
          </div>
        </div>

        {/* Campaign Selection Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Simüle Edilecek Kampanyayı Seçin:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaigns
              .filter(c => filterMarketplace === 'all' || c.marketplace === filterMarketplace)
              .map(camp => {
                const isSelected = selectedCampaignId === camp.id;
                return (
                  <button
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(camp.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500 shadow-md shadow-orange-500/10 ring-1 ring-orange-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        camp.marketplace === 'trendyol' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-600/20 text-amber-300'
                      }`}>
                        {camp.marketplace}
                      </span>
                      {camp.badge && (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {camp.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-bold mt-1.5 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {camp.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {camp.description}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Batch Summary Stats Cards */}
      {batchResult && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Toplam Ürün */}
          <div 
            onClick={() => setStatusFilter('all')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'all' ? 'bg-slate-800 border-slate-600 ring-2 ring-slate-500' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Taranan Ürün</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xl font-bold text-white mt-1">{batchResult.totalProductsCount}</p>
            <span className="text-[10px] text-slate-500">Tüm katalog</span>
          </div>

          {/* Kârlı ve Güvenli */}
          <div 
            onClick={() => setStatusFilter('profitable')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'profitable' ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500' : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-400">🟢 Kârlı / Uygun</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400 mt-1">{batchResult.profitableCount}</p>
            <span className="text-[10px] text-slate-500">Kampanyaya girebilir</span>
          </div>

          {/* Barem Tuzağı */}
          <div 
            onClick={() => setStatusFilter('trap')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'trap' ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500' : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-amber-400">⚠️ Barem Tuzağı</span>
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-400 mt-1">{batchResult.trapCount}</p>
            <span className="text-[10px] text-slate-500">&lt;200 TL kargo riski</span>
          </div>

          {/* Düşük Marj */}
          <div 
            onClick={() => setStatusFilter('warning')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'warning' ? 'bg-yellow-950/40 border-yellow-500 ring-2 ring-yellow-500' : 'bg-slate-900/80 border-slate-800 hover:border-yellow-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-yellow-400">🟡 Düşük Marj</span>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-xl font-bold text-yellow-400 mt-1">{batchResult.warningCount}</p>
            <span className="text-[10px] text-slate-500">Marj &lt;%6</span>
          </div>

          {/* Zararına Satış */}
          <div 
            onClick={() => setStatusFilter('loss')}
            className={`col-span-2 md:col-span-1 p-3.5 rounded-2xl border cursor-pointer transition ${
              statusFilter === 'loss' ? 'bg-red-950/40 border-red-500 ring-2 ring-red-500' : 'bg-slate-900/80 border-slate-800 hover:border-red-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-red-400">🔴 Zararına Satış</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-xl font-bold text-red-400 mt-1">{batchResult.lossMakingCount}</p>
            <span className="text-[10px] text-red-400/80 font-medium">KESİNLİKLE ÇIKARIN!</span>
          </div>

        </div>
      )}

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table Controls (Search & Quick Filter) */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Ürün adı, SKU veya kategori ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap">Durum:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Tümü ({batchResult?.results.length || 0})
            </button>
            <button
              onClick={() => setStatusFilter('profitable')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${statusFilter === 'profitable' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-emerald-400'}`}
            >
              Kârlı ({batchResult?.profitableCount || 0})
            </button>
            <button
              onClick={() => setStatusFilter('trap')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${statusFilter === 'trap' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-amber-400'}`}
            >
              Barem Tuzağı ({batchResult?.trapCount || 0})
            </button>
            <button
              onClick={() => setStatusFilter('loss')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${statusFilter === 'loss' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-red-400'}`}
            >
              Zarar Eden ({batchResult?.lossMakingCount || 0})
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Ürün Bilgisi</th>
                <th className="py-3 px-4">Kategori & Desi</th>
                <th className="py-3 px-4">Fiyat Değişimi</th>
                <th className="py-3 px-4">Birim Kâr Değişimi</th>
                <th className="py-3 px-4">Yeni Marj %</th>
                <th className="py-3 px-4">Başa Baş Hedefi</th>
                <th className="py-3 px-4">Risk & Danışman Durumu</th>
                <th className="py-3 px-4 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Filtreye uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredResults.map(res => (
                  <tr key={res.product.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Ürün Bilgisi */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {res.product.imageUrl && (
                          <img src={res.product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-white line-clamp-1 max-w-[220px]" title={res.product.title}>
                            {res.product.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">{res.product.sku}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              res.product.marketplace === 'trendyol' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-600/20 text-amber-300'
                            }`}>
                              {res.product.marketplace}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kategori & Desi */}
                    <td className="py-3 px-4">
                      <p className="text-slate-300 line-clamp-1">{res.product.category}</p>
                      <span className="text-[10px] text-slate-500">{res.product.desi} Desi | Komisyon %{res.simulated.commissionRate}</span>
                    </td>

                    {/* Fiyat Değişimi */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span className="line-through text-slate-500 text-[11px]">{res.baseline.price} TL</span>
                        <ArrowUpRight className="w-3 h-3 text-orange-400 rotate-90" />
                        <span className="font-bold text-white text-xs">{res.simulated.price} TL</span>
                      </div>
                      <span className="text-[10px] text-orange-400 font-sans">(-{res.simulated.discountAmount} TL)</span>
                    </td>

                    {/* Birim Kâr Değişimi */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400 text-[11px]">{res.baseline.netProfit > 0 ? '+' : ''}{res.baseline.netProfit} TL</span>
                        <span className="text-slate-600">→</span>
                        <span className={`font-bold text-xs ${res.simulated.netProfit < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {res.simulated.netProfit > 0 ? '+' : ''}{res.simulated.netProfit} TL
                        </span>
                      </div>
                      <span className={`text-[10px] font-sans ${res.profitDelta < 0 ? 'text-red-400/80' : 'text-emerald-400/80'}`}>
                        {res.profitDelta >= 0 ? '+' : ''}{res.profitDelta} TL ({res.profitDeltaPercent}%)
                      </span>
                    </td>

                    {/* Yeni Marj % */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                        res.simulated.marginPercent < 0 
                          ? 'bg-red-500/20 text-red-400'
                          : res.simulated.marginPercent < 6
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        %{res.simulated.marginPercent}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Eski: %{res.baseline.marginPercent}</p>
                    </td>

                    {/* Başa Baş Çarpanı */}
                    <td className="py-3 px-4">
                      {res.breakEvenSalesMultiplier === Infinity ? (
                        <span className="text-red-400 font-bold text-[11px]">İmkansız (Zarar)</span>
                      ) : (
                        <div>
                          <span className="font-bold text-white text-xs">{res.breakEvenSalesMultiplier}x</span>
                          <span className="text-slate-400 text-[10px]"> ({res.requiredUnitSales} adet/ay)</span>
                        </div>
                      )}
                    </td>

                    {/* Risk & Danışman Durumu */}
                    <td className="py-3 px-4">
                      {res.riskLevel === 'CRITICAL_LOSS' && (
                        <div className="flex items-center space-x-1 text-red-400 font-semibold text-xs">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>Zararına Satış</span>
                        </div>
                      )}
                      {res.riskLevel === 'TRAP_SHIPPING_THRESHOLD' && (
                        <div className="flex items-center space-x-1 text-amber-400 font-semibold text-xs">
                          <Truck className="w-4 h-4 shrink-0" />
                          <span>Barem Tuzağı (&lt;200 TL)</span>
                        </div>
                      )}
                      {res.riskLevel === 'WARNING_LOW_MARGIN' && (
                        <div className="flex items-center space-x-1 text-yellow-400 font-semibold text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Düşük Marj Risk</span>
                        </div>
                      )}
                      {(res.riskLevel === 'SAFE_PROFITABLE' || res.riskLevel === 'EXCELLENT') && (
                        <div className="flex items-center space-x-1 text-emerald-400 font-semibold text-xs">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>Kârlı & Güvenli</span>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{res.smartAdvice}</p>
                    </td>

                    {/* Aksiyon */}
                    <td className="py-3 px-4 text-right">
                      {onOpenInPlayground && (
                        <button
                          onClick={() => onOpenInPlayground(res.product)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-orange-500/20 hover:text-orange-400 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                          title="Bu ürünü canlı simülatörde detaylı incele"
                        >
                          İncele
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
