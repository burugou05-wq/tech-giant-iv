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
    aiProducts, aiFinances, currentYear, logs, contentOwned 
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
              } ${isLocked ? 'opacity-60' : ''}`}
            >
              <span className="text-lg">{isLocked ? '🔒' : tab.icon}</span>
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto relative">
        {markets[activeMarket]?.locked && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-700 m-1 animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-800 p-6 rounded-full shadow-2xl mb-4 border border-slate-700">
              <span className="text-5xl">🌐</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">市場未踏足</h3>
            <p className="text-slate-400 text-center max-w-xs mb-6 font-bold">
              この市場への進出には企業方針<br/>
              <span className="text-indigo-400">「海外展開戦略」</span>の研究完了が必要です。
            </p>
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
