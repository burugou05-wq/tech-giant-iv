import { useState } from 'react';
import { useGame } from '../../context/GameContext.jsx';
import CompanyDetailPanel from '../CompanyDetailPanel.jsx';
import MarketCard from './Market/MarketCard.jsx';
import MarketNews from './Market/MarketNews.jsx';
import { useMarketData } from '../../hooks/useMarketData.js';

export default function Market() {
  const { 
    markets, money, completedFocuses, upgradeMarketing, 
    buildDirectStore, closeDirectStore, blueprints, 
    aiProducts, aiFinances, currentYear, logs, contentOwned, yenRate
  } = useGame();
  
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeMarket, setActiveMarket] = useState('jp');
  
  const canUseDirectStore = completedFocuses.includes('fc_direct_store');

  const { activeMarketData, jvPairs, playerBest } = useMarketData(
    markets, activeMarket, aiFinances, blueprints, currentYear, contentOwned, completedFocuses
  );

  const marketTabs = [
    { id: 'jp', name: '日本市場', icon: '🇯🇵' },
    { id: 'na', name: '北米市場', icon: '🇺🇸' },
    { id: 'eu', name: '欧州市場', icon: '🇪🇺' },
    { id: 'cn', name: '中国市場', icon: '🇨🇳' },
  ];

  return (
    <div className="space-y-6 relative">
      {/* 地域サブタブ */}
      <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-700/50 w-full lg:w-fit mx-auto shadow-2xl backdrop-blur-md">
        {marketTabs.map(tab => {
          const isLocked = markets[tab.id]?.locked;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMarket(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
                activeMarket === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-105' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.name}
              {isLocked && <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded ml-1">未進出</span>}
            </button>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto relative">
        {markets[activeMarket]?.locked && (
          <div className="absolute top-4 right-4 z-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
            ⚠️ 市場未進出（販売不可）
          </div>
        )}
        <MarketCard 
          mKey={activeMarket}
          market={activeMarketData}
          jvPairs={jvPairs}
          aiFinances={aiFinances}
          aiProducts={aiProducts}
          playerBest={playerBest}
          currentYear={currentYear}
          money={money}
          yenRate={yenRate}
          canUseDirectStore={canUseDirectStore}
          upgradeMarketing={upgradeMarketing}
          buildDirectStore={buildDirectStore}
          closeDirectStore={closeDirectStore}
          onSelectCompany={setSelectedCompany}
        />
      </div>

      {/* 競合他社詳細パネル */}
      <CompanyDetailPanel 
        companyId={selectedCompany} 
        onClose={() => setSelectedCompany(null)} 
      />

      {/* マーケットニュースログ */}
      <MarketNews logs={logs} />
    </div>
  );
}
