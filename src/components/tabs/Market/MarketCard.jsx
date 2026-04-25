import { AI_COMPANIES } from '../../../constants/companies/index.js';
import { Card, CardHeader, CardContent } from '../../ui/index.js';
import { MarketRivalry } from './MarketRivalry.jsx';

export default function MarketCard({
  mKey,
  market,
  jvPairs,
  aiFinances,
  aiProducts,
  playerBest,
  currentYear,
  money,
  canUseDirectStore,
  upgradeMarketing,
  buildDirectStore,
  closeDirectStore,
  onSelectCompany
}) {
  if (!market) return null;

  return (
    <Card hover glass={!market.locked} className={market.locked ? 'opacity-70' : ''}>
      <CardHeader>
        <div className="flex flex-col">
          <h4 className="text-xl font-black text-white">{market.name}</h4>
          {!market.locked && (
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              週次推定需要: <span className="text-blue-400">{market.demand.toLocaleString()}</span> 個
            </span>
          )}
        </div>
        <div className="text-right">
          {market.locked && <div className="text-[10px] text-amber-300 font-bold">進出未完了</div>}
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">市場シェア</div>
          <div className="text-3xl font-black text-green-400">{(market.shares.player * 100).toFixed(1)}%</div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 広告レベル */}
        <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 font-black uppercase">マーケティング</span>
            <span className="text-xs font-bold text-white uppercase">レベル {market.marketing}</span>
          </div>
          <button
            onClick={() => upgradeMarketing(mKey)}
            disabled={market.locked}
            className={`text-[10px] px-4 py-1.5 rounded-full font-black transition-all ${
              market.locked ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {market.locked ? 'ロック中' : `広告強化 ($${((market.marketing + 1) * 1000).toLocaleString()}k)`}
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
              style={{ width: `${market.shares.player * 100}%` }} 
              title={`自社: ${(market.shares.player * 100).toFixed(1)}%`}
            />
            {Object.keys(AI_COMPANIES).filter(id => {
              const f = aiFinances[id];
              if (!f || f.isBankrupt) return false;
              if (f.parentId && f.maType === 'JV') return false; // JV子は親がまとめて描画
              return true;
            }).map(id => {
              let share = (market.shares[id] || 0) * 100;
              let label = AI_COMPANIES[id].name;
              if (jvPairs[id]) {
                jvPairs[id].forEach(childId => {
                  share += (market.shares[childId] || 0) * 100;
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
          <MarketRivalry market={market} aiProducts={aiProducts} playerBest={playerBest} />
        </div>

        {/* 凡例 */}
        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/40 p-3 rounded-xl border border-slate-700/30">
          <div className="flex items-center gap-2 font-bold text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
            自社 <span className="ml-auto">{(market.shares.player * 100).toFixed(1)}%</span>
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
              let share = (market.shares[id] || 0) * 100;
              if (jvPairs[id]) {
                jvPairs[id].forEach(childId => {
                  label += ` & ${AI_COMPANIES[childId].name}`;
                  share += (market.shares[childId] || 0) * 100;
                });
              }
              return (
                <button
                  key={id}
                  onClick={() => onSelectCompany(id)}
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
            <span className="text-slate-300">{market.stores} 店舗</span>
          </div>
          
          {canUseDirectStore ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => buildDirectStore(mKey)}
                disabled={market.locked || money < 5000}
                className={`text-[10px] py-2 rounded-xl font-black transition-all border ${
                  market.locked || money < 5000 
                    ? 'bg-slate-800 border-slate-700 text-slate-600' 
                    : 'bg-emerald-600/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/20'
                }`}
              >
                店舗設立 (-$5000k)
              </button>
              <button
                onClick={() => closeDirectStore(mKey)}
                disabled={market.locked || market.stores === 0}
                className={`text-[10px] py-2 rounded-xl font-black transition-all border ${
                  market.locked || market.stores === 0 
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
}
