import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Sliders, 
  DollarSign, 
  Percent, 
  Truck, 
  X, 
  Check,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Product, MarketplaceType } from '../../types/index.js';
import { createProduct, updateProduct, deleteProduct } from '../../services/api.js';

interface ProductCatalogProps {
  products: Product[];
  onRefreshProducts: () => void;
  onOpenInPlayground: (product: Product) => void;
  filterMarketplace?: MarketplaceType | 'all';
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onRefreshProducts,
  onOpenInPlayground,
  filterMarketplace = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSku, setFormSku] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Kadın Giyim & Moda');
  const [formMarketplace, setFormMarketplace] = useState<MarketplaceType>('trendyol');
  const [formListingPrice, setFormListingPrice] = useState<number>(250);
  const [formCostPrice, setFormCostPrice] = useState<number>(90);
  const [formDesi, setFormDesi] = useState<number>(1.0);
  const [formMonthlySales, setFormMonthlySales] = useState<number>(50);
  const [formStock, setFormStock] = useState<number>(100);
  const [formImageUrl, setFormImageUrl] = useState<string>('');

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

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormSku(`SKU-${Date.now().toString().slice(-4)}`);
    setFormCategory('Kadın Giyim & Moda');
    setFormMarketplace(filterMarketplace !== 'all' ? filterMarketplace : 'trendyol');
    setFormListingPrice(250);
    setFormCostPrice(90);
    setFormDesi(1.0);
    setFormMonthlySales(50);
    setFormStock(100);
    setFormImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormSku(p.sku);
    setFormCategory(p.category);
    setFormMarketplace(p.marketplace);
    setFormListingPrice(p.listingPrice);
    setFormCostPrice(p.costPrice);
    setFormDesi(p.desi);
    setFormMonthlySales(p.currentMonthlySales || 50);
    setFormStock(p.stock || 100);
    setFormImageUrl(p.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title: formTitle,
          sku: formSku,
          category: formCategory,
          marketplace: formMarketplace,
          listingPrice: formListingPrice,
          costPrice: formCostPrice,
          desi: formDesi,
          currentMonthlySales: formMonthlySales,
          stock: formStock,
          imageUrl: formImageUrl || undefined
        });
      } else {
        await createProduct({
          title: formTitle,
          sku: formSku,
          category: formCategory,
          marketplace: formMarketplace,
          listingPrice: formListingPrice,
          costPrice: formCostPrice,
          desi: formDesi,
          currentMonthlySales: formMonthlySales,
          stock: formStock,
          imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80'
        });
      }
      setIsModalOpen(false);
      onRefreshProducts();
    } catch (err) {
      alert('Kayıt sırasında hata oluştu: ' + err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await deleteProduct(id);
      onRefreshProducts();
    } catch (err) {
      alert('Silinemedi: ' + err);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesMp = filterMarketplace === 'all' || p.marketplace === filterMarketplace;
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);

    return matchesMp && matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Katalog & Birim İktisadı (COGS)
            </span>
            <span className="text-slate-400 text-xs font-medium">{products.length} Aktif Ürün</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1 tracking-tight">
            Ürün Envanteri & Maliyet Yönetimi
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl">
            Tüm ürünlerinizin alış maliyetlerini, desi değerlerini ve normal satış kârlılıklarını yönetin. Simülatör tüm hesaplamaları buradaki gerçek veriler üzerinden yapar.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Ürün Ekle</span>
        </button>
      </div>

      {/* Table & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Ürün adı, SKU veya barkod ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Kategori:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Ürün Bilgisi</th>
                <th className="py-3 px-4">Kategori & Desi</th>
                <th className="py-3 px-4">Satış Fiyatı</th>
                <th className="py-3 px-4">Alış Maliyeti (COGS)</th>
                <th className="py-3 px-4">Komisyon & Kargo</th>
                <th className="py-3 px-4">Normal Net Kâr</th>
                <th className="py-3 px-4">Marj %</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Kayıtlı ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const base = p.baselineUnitEconomics;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      
                      {/* Ürün */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white line-clamp-1 max-w-[200px]" title={p.title}>
                              {p.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-mono">{p.sku}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                p.marketplace === 'trendyol' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-600/20 text-amber-300'
                              }`}>
                                {p.marketplace}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori & Desi */}
                      <td className="py-3 px-4">
                        <p className="text-slate-300 line-clamp-1">{p.category}</p>
                        <span className="text-[10px] text-slate-500">{p.desi} Desi | Stok: {p.stock}</span>
                      </td>

                      {/* Satış Fiyatı */}
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {p.listingPrice.toFixed(2)} TL
                      </td>

                      {/* Alış Maliyeti */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {p.costPrice.toFixed(2)} TL
                      </td>

                      {/* Kesintiler */}
                      <td className="py-3 px-4">
                        {base && (
                          <div className="text-[11px] text-slate-400 space-y-0.5">
                            <div>Komisyon (%{base.commissionRate}): -{base.commissionAmount.toFixed(1)} TL</div>
                            <div>Kargo: -{base.shippingFee.toFixed(1)} TL</div>
                          </div>
                        )}
                      </td>

                      {/* Net Kâr */}
                      <td className="py-3 px-4 font-mono font-bold">
                        {base && (
                          <span className={base.netProfit > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {base.netProfit > 0 ? '+' : ''}{base.netProfit.toFixed(2)} TL
                          </span>
                        )}
                      </td>

                      {/* Marj % */}
                      <td className="py-3 px-4">
                        {base && (
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                            base.marginPercent < 6 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            %{base.marginPercent}
                          </span>
                        )}
                      </td>

                      {/* Aksiyonlar */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onOpenInPlayground(p)}
                            className="p-1.5 bg-slate-800 hover:bg-orange-500/20 text-orange-400 rounded-lg transition"
                            title="Canlı Simülatörde Aç"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-400" />
                <span>{editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ürün Başlığı / Adı</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Örn: Pamuklu Basic T-Shirt"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">SKU / Stok Kodu</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pazaryeri</label>
                  <select
                    value={formMarketplace}
                    onChange={(e) => setFormMarketplace(e.target.value as MarketplaceType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  >
                    <option value="trendyol">Trendyol</option>
                    <option value="hepsiburada">Hepsiburada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Satış Fiyatı (TL)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formListingPrice}
                    onChange={(e) => setFormListingPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Alış Fiyatı (COGS)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Desi</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formDesi}
                    onChange={(e) => setFormDesi(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Aylık Satış Adedi</label>
                  <input
                    type="number"
                    value={formMonthlySales}
                    onChange={(e) => setFormMonthlySales(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Görsel URL (Opsiyonel)</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-500/20 transition"
                >
                  {editingProduct ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
