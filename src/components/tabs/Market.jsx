import { useState } from 'react';
import { X, TrendingUp, Package, BarChart2, Zap, Radio } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';
import { AI_COMPANIES, CHASSIS_TECH } from '../../constants/index.js';



import CompanyDetailPanel from '../CompanyDetailPanel.jsx';

export default function Market() {
  const { markets, money, completedFocuses, upgradeMarketing, buildDirectStore, closeDirectStore, blueprints, aiProducts, currentYear, stockPrice, logs } = useGame();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const canUseDirectStore = completedFocuses.includes('fc_direct_store');

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.keys(markets).map(mKey => {
          const m = markets[mKey];
          return (
            <div key={mKey} className={`p-6 rounded-2xl border shadow-2xl space-y-6 ${m.locked ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-800 border-slate-700'} `}>
              <div className="flex justify-between items-end mb-4">
                <h4 className="text-xl font-black text-white">{m.name}</h4>
                <div className="text-right">
                  {m.locked && <div className="text-[10px] text-amber-300">進出未完了</div>}
                  <div className="text-[10px] text-slate-500">自社シェア</div>
                  <div className="text-3xl font-black text-green-400">{(m.shares.player * 100).toFixed(1)}%</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-700">
                  <div className="text-xs font-bold">広告 Lv.{m.marketing}</div>
                  <button
                    onClick={() => upgradeMarketing(mKey)}
                    disabled={m.locked}
                    className={`text-[10px] px-3 py-1 rounded-full font-bold ${m.locked ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white'}`}
                  >
                    {m.locked ? 'ロック中' : `強化 ($${(m.marketing + 1) * 1000}k)`}
                  </button>
                </div>
                {/* シェアバー */}
                <div className="w-full bg-slate-900 rounded-full h-5 overflow-hidden flex border border-slate-700 shadow-inner">
                  <div className="bg-green-500 h-full" style={{ width: `${m.shares.player * 100}%` }} />
                  {Object.keys(AI_COMPANIES).map(aiId => (
                    <div
                      key={aiId}
                      className={`${AI_COMPANIES[aiId].color} h-full border-l border-black/10`}
                      style={{ width: `${m.shares[aiId] * 100}%` }}
                    />
                  ))}
                </div>
                {/* 凡例 — 会社名をクリック可能ボタンに */}
                <div className="grid grid-cols-2 gap-1 text-[10px] mt-3">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" />自社 {(m.shares.player * 100).toFixed(1)}%</div>
                  {Object.entries(AI_COMPANIES)
                    .filter(([, ai]) => {
                      const r = /** @type {Record<string, number>} */ (ai.regions);
                      return currentYear >= ai.appearsYear && 
                             currentYear <= (ai.disappearsYear || Infinity) &&
                             r && r[mKey] && currentYear >= r[mKey];
                    })
                    .map(([id, ai]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedCompany(id)}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity text-left group"
                    >
                      <span className={`w-2 h-2 ${ai.color} rounded-full`} />
                      <span className={`${ai.textColor} group-hover:underline`}>{ai.name}</span>
                      <span className="text-slate-500 ml-auto">{((m.shares[id] || 0) * 100).toFixed(1)}%</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-[10px] text-slate-500">直営店: {m.stores}店舗</div>
                  <div className="text-[10px] text-slate-500">{m.locked ? '企業方針で海外展開を解除すると利用可能になります。' : `需要: ${m.demand.toLocaleString()}個/期`}</div>
                </div>
                <div className="space-y-2 mt-2">
                  {canUseDirectStore ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => buildDirectStore(mKey)}
                        disabled={m.locked || money < 5000}
                        className={`text-[10px] px-3 py-2 rounded-full font-bold ${m.locked || money < 5000 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white'}`}
                      >
                        {m.locked ? 'ロック中' : `設立 ($5000k)`}
                      </button>
                      <button
                        onClick={() => closeDirectStore(mKey)}
                        disabled={m.locked || m.stores === 0}
                        className={`text-[10px] px-3 py-2 rounded-full font-bold ${m.locked || m.stores === 0 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-rose-600 text-white'}`}
                      >
                        撤去
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500">直営店は「直営店創設」完了後に利用可能です。</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 競合他社詳細パネル */}
      <CompanyDetailPanel 
        companyId={selectedCompany} 
        onClose={() => setSelectedCompany(null)} 
      />
      {/* マーケットニュースログ */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-80 mt-6">
        <h3 className="font-black text-slate-200 flex items-center gap-2 text-lg mb-4">
          <Radio size={20} className="text-blue-400" /> マーケットニュース
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className={`p-4 rounded-xl border-l-4 transition-all hover:bg-slate-700/30 ${
              log.type === 'alert' 
                ? 'bg-red-900/10 border-red-500 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                : 'bg-slate-900/40 border-slate-600 text-slate-300'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold opacity-50 tracking-tighter uppercase">{log.time}</span>
                {log.type === 'alert' && <span className="text-[9px] bg-red-500 text-white px-1.5 rounded-full font-black animate-pulse">URGENT</span>}
              </div>
              <p className={`text-xs leading-relaxed ${log.color || ''}`}>{log.msg}</p>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <Radio size={40} className="opacity-10 mb-2" />
              <div className="text-xs font-bold">市場ニュースは現在ありません</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
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
