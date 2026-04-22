import { useState, useMemo } from 'react';
import { Radio } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';
import { AI_COMPANIES } from '../../constants/companies/index.js';
import { Card, CardHeader, CardContent, ProgressBar } from '../ui/index.js';
import CompanyDetailPanel from '../CompanyDetailPanel.jsx';
import { MarketRivalry } from './Market/MarketRivalry.jsx';
import { calculateEffectiveAppeal, getCurrentEffects } from '../../utils/gameLogic.js';

export default function Market() {
  const { markets, money, completedFocuses, upgradeMarketing, buildDirectStore, closeDirectStore, blueprints, aiProducts, aiFinances, currentYear, stockPrice, logs, contentOwned } = useGame();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [newsFilter, setNewsFilter] = useState('all');
  const canUseDirectStore = completedFocuses.includes('fc_direct_store');

  const effects = useMemo(() => getCurrentEffects(completedFocuses), [completedFocuses]);
  const [activeMarket, setActiveMarket] = useState('jp');

  const filteredLogs = useMemo(() => {
    if (newsFilter === 'all') return logs;
    if (newsFilter === 'alert') return logs.filter(l => l.type === 'alert' || l.type === 'error');
    if (newsFilter === 'ma') return logs.filter(l => l.msg.includes('【') && (l.msg.includes('提携') || l.msg.includes('買収') || l.msg.includes('統合') || l.msg.includes('独立') || l.msg.includes('再建') || l.msg.includes('再生') || l.msg.includes('子会社')));
    return logs;
  }, [logs, newsFilter]);

  const marketTabs = [
    { id: 'jp', name: '日本市場', icon: '🇯🇵' },
    { id: 'na', name: '北米市場', icon: '🇺🇸' },
    { id: 'eu', name: '欧州市場', icon: '🇪🇺' },
    { id: 'cn', name: '中国市場', icon: '🇨🇳' },
  ];

  // 各市場でのプレイヤーの最良製品を特定
  const getPlayerBest = (mKey) => {
    const sellable = blueprints
      .map(bp => ({ 
        bp, 
        app: calculateEffectiveAppeal(bp, currentYear, contentOwned, effects) 
      }))
      .sort((a, b) => b.app - a.app);
    return sellable[0] || null;
  };

  return (
    <div className="space-y-6 relative">
      {/* 地域サブタブ */}
      <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-700/50 w-full lg:w-fit mx-auto shadow-2xl backdrop-blur-md">
        {marketTabs.map(tab => (
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
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {Object.keys(markets).filter(k => k === activeMarket).map(mKey => {
          const m = markets[mKey];

          // JVペアの特定
          const jvPairs = {};
          Object.keys(aiFinances).forEach(id => {
            const f = aiFinances[id];
            if (f.parentId && f.maType === 'JV') {
              if (!jvPairs[f.parentId]) jvPairs[f.parentId] = [];
              jvPairs[f.parentId].push(id);
            }
          });

          return (
            <Card key={mKey} hover glass={!m.locked} className={m.locked ? 'opacity-70' : ''}>
              <CardHeader>
                <div className="flex flex-col">
                  <h4 className="text-xl font-black text-white">{m.name}</h4>
                  {!m.locked && (
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      週次推定需要: <span className="text-blue-400">{m.demand.toLocaleString()}</span> 個
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {m.locked && <div className="text-[10px] text-amber-300 font-bold">進出未完了</div>}
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">市場シェア</div>
                  <div className="text-3xl font-black text-green-400">{(m.shares.player * 100).toFixed(1)}%</div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* 広告レベル */}
                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 font-black uppercase">マーケティング</span>
                    <span className="text-xs font-bold text-white uppercase">レベル {m.marketing}</span>
                  </div>
                  <button
                    onClick={() => upgradeMarketing(mKey)}
                    disabled={m.locked}
                    className={`text-[10px] px-4 py-1.5 rounded-full font-black transition-all ${
                      m.locked ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    }`}
                  >
                    {m.locked ? 'ロック中' : `広告強化 ($${((m.marketing + 1) * 1000).toLocaleString()}k)`}
                  </button>
                </div>

                {/* シェアバー */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">勢力図</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden flex border border-slate-700/50 shadow-inner p-0.5">
                    <div 
                      className="bg-green-500 h-full rounded-l-full transition-all duration-1000" 
                      style={{ width: `${m.shares.player * 100}%` }} 
                      title={`自社: ${(m.shares.player * 100).toFixed(1)}%`}
                    />
                    {Object.keys(AI_COMPANIES).filter(id => {
                      const f = aiFinances[id];
                      if (!f || f.isBankrupt) return false;
                      if (f.parentId && f.maType === 'JV') return false; // JV子は親がまとめて描画
                      return true;
                    }).map(id => {
                      let share = (m.shares[id] || 0) * 100;
                      let label = AI_COMPANIES[id].name;
                      if (jvPairs[id]) {
                        jvPairs[id].forEach(childId => {
                          share += (m.shares[childId] || 0) * 100;
                          label += ` & ${AI_COMPANIES[childId].name}`;
                        });
                      }
                      if (share <= 0) return null;
                      return (
                        <div
                          key={id}
                          className={`${AI_COMPANIES[id].color} h-full border-l border-white/5 cursor-help`}
                          style={{ width: `${share}%` }}
                          title={`${label}: ${share.toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>
                  
                  {/* 直接対決：ライバル分析 */}
                  <MarketRivalry market={m} aiProducts={aiProducts} playerBest={getPlayerBest(mKey)} />
                </div>

                {/* 凡例 */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/40 p-3 rounded-xl border border-slate-700/30">
                  <div className="flex items-center gap-2 font-bold text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                    自社 <span className="ml-auto">{(m.shares.player * 100).toFixed(1)}%</span>
                  </div>
                  {Object.entries(AI_COMPANIES)
                    .filter(([id, ai]) => {
                      const r = /** @type {Record<string, number>} */ (ai.regions);
                      const fin = aiFinances ? aiFinances[id] : null;
                      if (!fin || fin.isBankrupt) return false;
                      if (fin.parentId && fin.maType === 'JV') return false; // JV子はスキップ
                      return currentYear >= ai.appearsYear && 
                             currentYear <= (ai.disappearsYear || Infinity) &&
                             r && r[mKey] && currentYear >= r[mKey];
                    })
                    .map(([id, ai]) => {
                      let label = ai.name;
                      let share = (m.shares[id] || 0) * 100;
                      if (jvPairs[id]) {
                        jvPairs[id].forEach(childId => {
                          label += ` & ${AI_COMPANIES[childId].name}`;
                          share += (m.shares[childId] || 0) * 100;
                        });
                      }
                      return (
                        <button
                          key={id}
                          onClick={() => setSelectedCompany(id)}
                          className="flex items-center gap-2 hover:bg-slate-700/50 p-1 rounded transition-colors group"
                        >
                          <div className={`w-2 h-2 ${ai.color} rounded-full`} />
                          <span className={`${ai.textColor} font-bold group-hover:underline text-left truncate max-w-[80px]`}>
                            {label}
                          </span>
                          <span className="text-slate-500 ml-auto font-mono">{share.toFixed(1)}%</span>
                        </button>
                      );
                    })}
                </div>

                {/* 店舗管理 */}
                <div className="pt-2 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                    <span>直営店舗ネットワーク</span>
                    <span className="text-slate-300">{m.stores} 店舗</span>
                  </div>
                  
                  {canUseDirectStore ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => buildDirectStore(mKey)}
                        disabled={m.locked || money < 5000}
                        className={`text-[10px] py-2 rounded-xl font-black transition-all border ${
                          m.locked || money < 5000 
                            ? 'bg-slate-800 border-slate-700 text-slate-600' 
                            : 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/20'
                        }`}
                      >
                        店舗設立 (-$5000k)
                      </button>
                      <button
                        onClick={() => closeDirectStore(mKey)}
                        disabled={m.locked || m.stores === 0}
                        className={`text-[10px] py-2 rounded-xl font-black transition-all border ${
                          m.locked || m.stores === 0 
                            ? 'bg-slate-800 border-slate-700 text-slate-600' 
                            : 'bg-rose-600/10 border-rose-500/50 text-rose-400 hover:bg-rose-600/20'
                        }`}
                      >
                        撤去
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-900/50 rounded-xl text-[10px] text-slate-500 italic text-center border border-slate-800">
                      直営店は未開放です
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 競合他社詳細パネル */}
      <CompanyDetailPanel 
        companyId={selectedCompany} 
        onClose={() => setSelectedCompany(null)} 
      />

      {/* マーケットニュースログ */}
      <Card className="flex flex-col h-96">
        <CardHeader className="flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex flex-col">
            <h3 className="font-black text-slate-200 flex items-center gap-2 text-lg">
              <Radio size={20} className="text-blue-400" /> マーケットニュース
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">リアルタイムフィード</span>
          </div>

          <div className="flex gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800 ml-auto">
            {[
              { id: 'all', name: 'すべて' },
              { id: 'alert', name: '重要' },
              { id: 'ma', name: 'M&A・提携' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setNewsFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                  newsFilter === f.id ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filteredLogs.map((log, i) => (
            <div key={i} className={`p-4 rounded-xl border-l-4 transition-all hover:bg-slate-700/30 ${
              log.type === 'alert' || log.type === 'error'
                ? 'bg-red-900/10 border-red-500 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                : log.type === 'warning'
                ? 'bg-amber-900/10 border-amber-500 text-amber-100'
                : 'bg-slate-900/40 border-slate-700/50 text-slate-300'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black opacity-50 tracking-tighter uppercase">{log.time}</span>
                {(log.type === 'alert' || log.type === 'error') && <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">URGENT</span>}
              </div>
              <p className={`text-xs leading-relaxed font-medium ${log.color || ''}`}>{log.msg}</p>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-700">
              <Radio size={40} className="opacity-10 mb-2" />
              <div className="text-xs font-bold uppercase tracking-widest opacity-30">表示するニュースがありません</div>
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
