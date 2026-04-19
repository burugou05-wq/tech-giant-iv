import { Landmark, RefreshCcw, Briefcase, ShieldCheck, Film, Radio, Scale } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';
import { CONTENT_INVESTMENTS, DECISIONS } from '../../constants/index.js';

export default function Dashboard() {
  const {
    stockPrice, playerEquity, money, setMoney, setPlayerEquity, setStockPrice,
    lastTickProfit, currentEffects, yenRate, qualityLevel, setQualityLevel,
    contentOwned, setContentOwned, logs, leadershipPower, stateRef, executeDecision,
    orgStructure, updateBudgetAllocation, blueprints, currentYear,
  } = useGame();

  const totalCost = lastTickProfit.varCost + lastTickProfit.fixedCost
    + lastTickProfit.marketingCost + lastTickProfit.storeCost;
  const profit = lastTickProfit.revenue - totalCost;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左2列 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 株価カード */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-slate-700 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-900/40 rounded-full text-indigo-400"><Landmark size={28} /></div>
              <div>
                <div className="text-slate-400 text-xs font-bold tracking-widest">自社株価</div>
                <div className="text-4xl font-black text-white">${Math.floor(stockPrice)}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (playerEquity >= 100) return;
                  const c = Math.floor(5000 * (stockPrice / 100));
                  setMoney(prev => prev - c);
                  setPlayerEquity(p => p + 10);
                }}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm"
              >
                <RefreshCcw className="inline mr-2" size={16} />10%買戻し
              </button>
              <button
                onClick={() => {
                  if (playerEquity <= 10) return;
                  const f = Math.floor(5000 * (stockPrice / 100));
                  setMoney(prev => prev + f);
                  setPlayerEquity(p => p - 10);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm"
              >
                <Briefcase className="inline mr-2" size={16} />10%売却
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-slate-500 text-xs font-bold mb-1">手元資金</div>
              <div className={`text-2xl font-black ${money < 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                ${Math.floor(money).toLocaleString()}k
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold mb-1">週間利益</div>
              <div className={`text-2xl font-black ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}${Math.floor(profit).toLocaleString()}k
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold mb-1">為替レート</div>
              <div className="text-2xl font-black text-blue-400">1$ = {Math.floor(250 * yenRate)}円</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold mb-1">株式保有</div>
              <div className="text-2xl font-black text-yellow-500">{playerEquity}%</div>
            </div>
          </div>
        </div>

        {/* 品質 + エンタメ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-green-400" /> 品質管理
            </h3>
            <div className="flex items-center gap-6">
              <div className={`text-4xl font-black w-24 ${qualityLevel < 60 ? 'text-red-500' : 'text-green-500'}`}>
                {Math.min(qualityLevel, currentEffects.qualityCap)}%
              </div>
              <div className="flex-1">
                <input
                  type="range" min="30" max="100" value={qualityLevel}
                  onChange={e => setQualityLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold">
                  <span className="text-red-400">低コスト</span><span>標準</span><span className="text-blue-400">安全</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Film size={20} className="text-purple-400" /> エンタメ投資
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {CONTENT_INVESTMENTS.map(inv => {
                const isOwned = contentOwned.includes(inv.id);
                return (
                  <button
                    key={inv.id}
                    disabled={isOwned || money < inv.cost}
                    onClick={() => { setMoney(prev => prev - inv.cost); setContentOwned(p => [...p, inv.id]); }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isOwned ? 'border-purple-500 bg-purple-900/20' : 'border-slate-700 hover:border-slate-500 bg-slate-900'
                    }`}
                  >
                    <div className="font-bold text-[10px] text-white leading-tight">{inv.name}</div>
                    {!isOwned && <div className="text-[9px] text-slate-500 mt-1">${inv.cost.toLocaleString()}k</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h3 className="font-bold text-slate-200 mb-4">製品ライフサイクル</h3>
          <div className="text-[10px] text-slate-400 mb-4">
            最古製品の年齢を管理し、新世代モデルへの乗り換えを適切に行うと競争力が高まります。
          </div>
          {blueprints.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-white font-black">最古製品:</div>
              <div className="text-[10px] text-slate-300">
                {Math.max(0, currentYear - Math.min(...blueprints.map(bp => bp.launchYear || currentYear)))} 年経過
              </div>
              <div className={`text-sm font-black ${currentYear - Math.min(...blueprints.map(bp => bp.launchYear || currentYear)) >= 4 ? 'text-amber-300' : 'text-slate-200'}`}>
                {currentYear - Math.min(...blueprints.map(bp => bp.launchYear || currentYear)) >= 4 ? '古いモデルに注意' : '次世代への準備OK'}
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-500">設計図を作成し、製品寿命管理を開始してください。</div>
          )}
        </div>
      </div>

      {/* 右1列: 緊急決議 */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
        <h3 className="font-black text-slate-200 flex items-center gap-2 text-lg mb-6">
          <Scale size={20} className="text-indigo-400" /> 緊急決議
        </h3>
        <div className="space-y-3 overflow-y-auto flex-1">
          {DECISIONS.map(dec => {
            const isVisible = !dec.req || (stateRef && dec.req(stateRef.current));
            if (!isVisible) return null;
            const canAfford = leadershipPower >= dec.lpCost && money >= dec.moneyCost;
            return (
              <button
                key={dec.id}
                onClick={() => executeDecision(dec)}
                disabled={!canAfford}
                className="w-full text-left p-4 bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-xl disabled:opacity-50 transition-all"
              >
                <div className="font-bold text-white text-sm mb-1">{dec.name}</div>
                <div className="text-[10px] text-slate-400">{dec.desc}</div>
                <div className="text-[10px] font-black text-indigo-400 mt-2">LP:{dec.lpCost} / ${dec.moneyCost.toLocaleString()}k</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
