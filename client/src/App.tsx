import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar.js';
import { LivePlayground } from './components/simulator/LivePlayground.js';
import { BatchCampaignSimulator } from './components/campaigns/BatchCampaignSimulator.js';
import { ProductCatalog } from './components/products/ProductCatalog.js';
import { CampaignList } from './components/campaigns/CampaignList.js';
import { AdvisorRadar } from './components/advisor/AdvisorRadar.js';
import { MarketplaceSettings } from './components/marketplaces/MarketplaceSettings.js';
import { Product, MarketplaceType } from './types/index.js';
import { fetchProducts, syncMarketplace } from './services/api.js';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('playground');
  const [activeMarketplace, setActiveMarketplace] = useState<MarketplaceType | 'all'>('all');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductForPlayground, setSelectedProductForPlayground] = useState<Product | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Ürünler yüklenemedi:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncMarketplace(activeMarketplace !== 'all' ? activeMarketplace : undefined);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(''), 4000);
      await loadProducts();
    } catch (err) {
      console.error('Senkronizasyon hatası:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenInPlayground = (product: Product) => {
    setSelectedProductForPlayground(product);
    setActiveTab('playground');
  };

  const handleSelectCampaignForBatch = (_campId: string) => {
    setActiveTab('batch');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeMarketplace={activeMarketplace}
        setActiveMarketplace={setActiveMarketplace}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <span>✓ {toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'playground' && (
          <LivePlayground
            products={products}
            selectedProduct={selectedProductForPlayground}
            onClearSelectedProduct={() => setSelectedProductForPlayground(null)}
          />
        )}

        {activeTab === 'batch' && (
          <BatchCampaignSimulator
            onOpenInPlayground={handleOpenInPlayground}
            filterMarketplace={activeMarketplace}
          />
        )}

        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            onRefreshProducts={loadProducts}
            onOpenInPlayground={handleOpenInPlayground}
            filterMarketplace={activeMarketplace}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignList
            onSelectCampaignForBatch={handleSelectCampaignForBatch}
            filterMarketplace={activeMarketplace}
          />
        )}

        {activeTab === 'advisor' && (
          <AdvisorRadar
            onOpenInPlayground={handleOpenInPlayground}
          />
        )}

        {activeTab === 'settings' && (
          <MarketplaceSettings />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 <strong>MarketLens</strong> - Türkiye E-Ticaret ve Pazaryeri Kampanya Kârlılık Sistemi</p>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Trendyol & Hepsiburada Uyumlu</span>
            <span>•</span>
            <span>Birim İktisadı (Unit Economics)</span>
            <span>•</span>
            <span>Kargo Barem Koruması</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
