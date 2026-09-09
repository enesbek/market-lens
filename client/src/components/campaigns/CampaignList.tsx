import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Calendar, 
  Percent, 
  Zap, 
  Gift, 
  ArrowRight, 
  Sliders,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Campaign, CampaignType, MarketplaceType } from '../../types/index.js';
import { fetchCampaigns, createCampaign } from '../../services/api.js';

interface CampaignListProps {
  onSelectCampaignForBatch: (campId: string) => void;
  filterMarketplace?: MarketplaceType | 'all';
}

export const CampaignList: React.FC<CampaignListProps> = ({
  onSelectCampaignForBatch,
  filterMarketplace = 'all'
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formType, setFormType] = useState<CampaignType>('cart_percent');
  const [formMarketplace, setFormMarketplace] = useState<MarketplaceType>('trendyol');
  const [formDiscountPercent, setFormDiscountPercent] = useState<number>(15);
  const [formFixedDiscount, setFormFixedDiscount] = useState<number>(50);
  const [formMinCart, setFormMinCart] = useState<number>(300);
  const [formPlatformShare, setFormPlatformShare] = useState<number>(50);
  const [formDescription, setFormDescription] = useState<string>('');

  const loadCampaigns = async () => {
    try {
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Kampanyalar yüklenemedi:', err);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCampaign({
        title: formTitle,
        type: formType,
        marketplace: formMarketplace,
        discountPercent: formDiscountPercent,
        fixedDiscountAmount: formFixedDiscount,
        minCartAmount: formMinCart,
        platformContributionPercent: formPlatformShare,
        description: formDescription
      });
      setIsModalOpen(false);
      loadCampaigns();
    } catch (err) {
      alert('Kampanya oluşturulamadı: ' + err);
    }
  };

  const filteredCampaigns = campaigns.filter(
    c => filterMarketplace === 'all' || c.marketplace === filterMarketplace
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Pazaryeri Teklifleri & Kampanya Havuzu
            </span>
            <span className="text-slate-400 text-xs font-medium">{filteredCampaigns.length} Kampanya</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1 tracking-tight">
            Aktif & Önerilen Pazaryeri Kampanyaları
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl">
            Trendyol ve Hepsiburada tarafından mağazanıza önerilen resmi kampanyaları inceleyin veya kendi özel kampanya senaryonuzu ekleyip analiz edin.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Özel Kampanya Ekle</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map(camp => (
          <div
            key={camp.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition shadow-lg relative group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  camp.marketplace === 'trendyol' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-600/20 text-amber-300'
                }`}>
                  {camp.marketplace}
                </span>
                {camp.badge && (
                  <span className="text-[10px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    {camp.badge}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-white mt-2 group-hover:text-orange-400 transition">
                {camp.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {camp.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Kampanya Tipi:</span>
                <span className="font-semibold text-slate-200">
                  {camp.type === 'cart_percent' && `Sepette %${camp.discountPercent} İndirim`}
                  {camp.type === 'flash_deal' && `Flaş İndirim (%${camp.discountPercent})`}
                  {camp.type === 'platform_coupon' && `${camp.fixedDiscountAmount} TL Kupon (%${camp.platformContributionPercent} Katkı)`}
                  {camp.type === 'second_item_discount' && `2. Ürüne %${camp.discountPercent} İndirim`}
                  {camp.type === 'seller_coupon' && `Mağaza Kuponu (${camp.fixedDiscountAmount} TL)`}
                  {camp.type === 'cart_fixed_over_limit' && `${camp.minCartAmount} TL Üzeri ${camp.fixedDiscountAmount} TL`}
                </span>
              </div>

              <button
                onClick={() => onSelectCampaignForBatch(camp.id)}
                className="w-full py-2 bg-slate-800 hover:bg-orange-500 hover:text-white text-orange-400 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <span>Tüm Kataloğa Simüle Et</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Create Custom Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Tag className="w-5 h-5 text-orange-400" />
                <span>Özel Kampanya Simülasyonu Oluştur</span>
              </h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Kampanya Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Hafta Sonu Özel Sepette %12"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pazaryeri</label>
                  <select
                    value={formMarketplace}
                    onChange={(e) => setFormMarketplace(e.target.value as MarketplaceType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="trendyol">Trendyol</option>
                    <option value="hepsiburada">Hepsiburada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kampanya Formatı</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as CampaignType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="cart_percent">Sepette % İndirim</option>
                    <option value="flash_deal">Flaş / Doğrudan Fiyat İndirimi</option>
                    <option value="second_item_discount">2. Ürüne % İndirim</option>
                    <option value="platform_coupon">Platform Destekli Kupon</option>
                    <option value="seller_coupon">Mağaza Kuponu</option>
                  </select>
                </div>
              </div>

              {formType === 'cart_percent' || formType === 'flash_deal' || formType === 'second_item_discount' ? (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">İndirim Oranı (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formDiscountPercent}
                    onChange={(e) => setFormDiscountPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Kupon Tutarı (TL)</label>
                    <input
                      type="number"
                      value={formFixedDiscount}
                      onChange={(e) => setFormFixedDiscount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Sepet Alt Limiti (TL)</label>
                    <input
                      type="number"
                      value={formMinCart}
                      onChange={(e) => setFormMinCart(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Açıklama / Not</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Kampanyanın amacı ve detayları..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                >
                  Oluştur ve Ekle
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
