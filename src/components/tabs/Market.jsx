import { useState } from 'react';
import { X, TrendingUp, Package, BarChart2, Zap, Radio } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';
import { AI_COMPANIES, CHASSIS_TECH } from '../../constants/index.js';



export default function Market() {
  const { markets, money, completedFocuses, upgradeMarketing, buildDirectStore, closeDirectStore, blueprints, aiProducts, currentYear, stockPrice, logs } = useGame();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const canUseDirectStore = completedFocuses.includes('fc_direct_store');

  const getCompanyStock = (aiId) => {
    const base = AI_COMPANIES[aiId]?.stockBase || 100;
    const appeal = aiProducts[aiId]?.appeal || 1;
    return Math.floor(base * (0.8 + appeal / 60));
  };

  const getCompanyRevenue = (aiId) => {
    const base = AI_COMPANIES[aiId]?.revenueBase || 50000;
    const totalShare = Object.values(markets).reduce((sum, m) => sum + (m.shares[aiId] || 0), 0);
    const years = Math.max(0, currentYear - 1946);
    return Math.floor(base * (0.5 + totalShare) * (1 + years * 0.008));
  };

  const getTotalShare = (aiId) => {
    const marketList = Object.values(markets).filter(m => !m.locked);
    if (marketList.length === 0) return 0;
    return marketList.reduce((sum, m) => sum + (m.shares[aiId] || 0), 0) / marketList.length;
  };

  const selectedAi = selectedCompany ? AI_COMPANIES[selectedCompany] : null;
  const selectedProfile = selectedCompany ? AI_COMPANIES[selectedCompany] : null;

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
      {selectedCompany && selectedAi && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-md h-full bg-slate-900 border-l border-slate-700 shadow-2xl overflow-y-auto animate-slide-in-right"
            style={{ animation: 'slideInRight 0.25s ease-out' }}
          >
            {/* ヘッダー */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full ${selectedAi.color}`} />
                <h2 className="text-xl font-black text-white">{selectedAi.name}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 ${selectedAi.textColor}`}>{selectedAi.trait}</span>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 株価・売上 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <TrendingUp size={12} /> 推定株価
                  </div>
                  <div className="text-2xl font-black text-white">${getCompanyStock(selectedCompany).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 mt-1">自社: ${Math.floor(stockPrice)}</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <BarChart2 size={12} /> 推定売上
                  </div>
                  <div className="text-2xl font-black text-emerald-400">${(getCompanyRevenue(selectedCompany) / 1000).toFixed(0)}M</div>
                  <div className="text-[10px] text-slate-500 mt-1">年間換算</div>
                </div>
              </div>

              {/* 市場シェア */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-bold mb-3">
                  <BarChart2 size={14} /> 市場シェア
                </div>
                <div className="space-y-3">
                  {Object.entries(markets).filter(([, m]) => !m.locked).map(([mKey, m]) => {
                    const share = (m.shares[selectedCompany] || 0) * 100;
                    const playerShare = m.shares.player * 100;
                    return (
                      <div key={mKey}>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>{m.name}</span>
                          <span className={selectedAi.textColor + ' font-black'}>{share.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden flex border border-slate-700">
                          <div className={`${selectedAi.color} h-full`} style={{ width: `${share}%` }} />
                          <div className="bg-green-500/40 h-full" style={{ width: `${playerShare}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
                          <span>{selectedAi.name}: {share.toFixed(1)}%</span>
                          <span className="text-green-400">自社: {playerShare.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-700">
                    平均シェア: <span className={selectedAi.textColor + ' font-black'}>{(getTotalShare(selectedCompany) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* 現在の主力製品 */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-bold mb-3">
                  <Package size={14} /> 現在の主力製品
                </div>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-600">
                  <div className={`font-black text-sm ${selectedAi.textColor}`}>{aiProducts[selectedCompany]?.productName || '—'}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    魅力度スコア: <span className="text-white font-bold">{(aiProducts[selectedCompany]?.appeal || 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* 過去の製品履歴 */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-bold mb-3">
                  <Package size={14} /> 製品の歴史
                </div>
                <div className="space-y-3">
                  {selectedProfile.history.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="text-[10px] text-slate-500 w-10 shrink-0 pt-0.5">{item.year}</div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.product}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 強み */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 text-slate-300 text-sm font-bold mb-3">
                  <Zap size={14} /> 強み
                </div>
                <ul className="space-y-2">
                  {selectedProfile.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <span className={`${selectedAi.textColor} mt-0.5 shrink-0`}>▸</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* 背景クリックで閉じる */}
          <div className="absolute inset-0 -z-10" onClick={() => setSelectedCompany(null)} />
        </div>
      )}
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
