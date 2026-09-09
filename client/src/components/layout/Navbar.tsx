import React from 'react';
import { 
  TrendingUp, 
  Sliders, 
  Layers, 
  Package, 
  Tag, 
  ShieldAlert, 
  Store, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { MarketplaceType } from '../../types/index.js';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeMarketplace: MarketplaceType | 'all';
  setActiveMarketplace: (mp: MarketplaceType | 'all') => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeMarketplace,
  setActiveMarketplace,
  onSync,
  isSyncing
}) => {
  const tabs = [
    { id: 'playground', label: 'Canlı Simülatör', icon: Sliders },
    { id: 'batch', label: 'Toplu Kampanya Analizi', icon: Layers, badge: 'Önemli' },
    { id: 'catalog', label: 'Ürün Kataloğu & Maliyetler', icon: Package },
    { id: 'campaigns', label: 'Pazaryeri Kampanya Havuzu', icon: Tag },
    { id: 'advisor', label: 'Tuzak & Danışman Radarı', icon: ShieldAlert, alertCount: 3 },
    { id: 'settings', label: 'Pazaryeri & Komisyon Ayarları', icon: Store }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('playground')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">Market<span className="text-orange-500">Lens</span></span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-400 rounded border border-orange-500/30">TR Pro</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Pazaryeri Kampanya & Kârlılık Motoru</p>
            </div>
          </div>

          {/* Marketplace Filter Pill Switcher */}
          <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveMarketplace('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeMarketplace === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tüm Pazaryerleri
            </button>
            <button
              onClick={() => setActiveMarketplace('trendyol')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeMarketplace === 'trendyol'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-orange-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
              <span>Trendyol</span>
            </button>
            <button
              onClick={() => setActiveMarketplace('hepsiburada')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeMarketplace === 'hepsiburada'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              <span>Hepsiburada</span>
            </button>
          </div>

          {/* Sync Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              title="Pazaryeri Fiyat ve Kampanya Verilerini Güncelle"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Senkronize...' : 'Pazaryeri Senk.'}</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-orange-500/20 text-orange-300 rounded">
                    {tab.badge}
                  </span>
                )}
                {tab.alertCount && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                    {tab.alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
