import React from 'react';
import { X, RefreshCcw, TrendingDown } from 'lucide-react';
import { Card } from '../../ui/index.js';
import { useGame } from '../../../context/GameContext.jsx';
import { calculateEffectiveAppeal } from '../../../utils/gameLogic.js';

export const BlueprintCatalog = ({ 
  blueprints, 
  currentYear, 
  money, 
  onRemove, 
  onRefresh, 
  onUpdatePrice,
  onUpdateStrategy,
  productionLines 
}) => {
  const { contentOwned, currentEffects } = useGame();
  
  const strategies = [
    { id: 'high-end', name: 'H', label: 'HIGH-END', color: 'amber' },
    { id: 'mainstream', name: 'M', label: 'MAINSTREAM', color: 'blue' },
    { id: 'budget', name: 'B', label: 'BUDGET', color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-slate-400 text-sm uppercase tracking-widest flex items-center gap-2">
          Design Archive <span className="text-slate-600">({blueprints.length})</span>
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
        {[...blueprints].reverse().map(bp => {
          const age = currentYear - (bp.launchYear || currentYear);
          const refreshCost = Math.max(8000, bp.cost * 3);
          const isUsedInProduction = productionLines.some(l => l.blueprintId === bp.id);
          
          const currentApp = calculateEffectiveAppeal(bp, currentYear, contentOwned, currentEffects);
          const appealLoss = bp.baseAppeal - Math.floor(currentApp);

          return (
            <Card key={bp.id} className="p-5 bg-slate-900/60 border-slate-800 hover:border-slate-700 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-black text-yellow-500 text-lg tracking-tight group-hover:text-yellow-400 transition-colors">
                    {bp.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">
                    発売: {bp.launchYear}年 / 第 {bp.generation || 1} 世代
                  </div>
                </div>
                <button
                  onClick={() => onRemove(bp.id)}
                  disabled={isUsedInProduction}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isUsedInProduction 
                      ? 'opacity-10 cursor-not-allowed' 
                      : 'hover:bg-red-500/20 text-slate-600 hover:text-red-500'
                  }`}
                  title={isUsedInProduction ? '生産ラインで使用中のため削除できません' : '削除'}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 戦略切り替えセクション */}
              <div className="flex items-center gap-2 mb-3 bg-slate-950/60 p-1 rounded-xl border border-slate-800/50 w-fit">
                {strategies.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onUpdateStrategy && onUpdateStrategy(bp.id, s.id)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${
                      (bp.strategy || 'mainstream') === s.id
                        ? `bg-${s.color}-500/20 text-${s.color}-400 border border-${s.color}-500/40 shadow-sm`
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                    title={s.label}
                  >
                    {s.name}
                  </button>
                ))}
                
                <div className="ml-2 pr-2 border-l border-slate-800 pl-2">
                  {bp.strategy === 'high-end' && bp.price < bp.cost * 2.5 && (
                    <span className="text-[8px] font-black text-rose-500 animate-pulse flex items-center gap-1">
                      <span className="w-1 h-1 bg-rose-500 rounded-full" /> 価格不足
                    </span>
                  )}
                  {bp.strategy === 'mainstream' && (
                    <span className="text-[7px] font-bold text-slate-500 uppercase">シェア連動</span>
                  )}
                  {bp.strategy === 'budget' && (
                    <span className="text-[7px] font-bold text-emerald-500 uppercase">低価格特化</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 relative overflow-hidden">
                  <div className="text-[8px] text-slate-600 font-black uppercase">Market Appeal</div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-sm font-black text-white">{Math.floor(currentApp)}</div>
                    {appealLoss > 0 && (
                      <div className="text-[9px] font-bold text-rose-500 flex items-center">
                        <TrendingDown size={8} /> {appealLoss}
                      </div>
                    )}
                  </div>
                  <div className="text-[7px] text-slate-500 font-bold uppercase mt-0.5">Base: {bp.baseAppeal}</div>
                </div>
                <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                  <div className="text-[8px] text-slate-600 font-black uppercase">Unit Cost</div>
                  <div className="text-sm font-black text-slate-300">${bp.cost}k</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-emerald-500/20 ring-1 ring-emerald-500/10 shadow-inner">
                  <div className="text-[8px] text-emerald-500 font-black uppercase flex justify-between items-center">
                    <span>Price</span>
                    <span className="animate-pulse">SET</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-emerald-400">$</span>
                    <input 
                      type="number"
                      value={bp.price}
                      onChange={(e) => onUpdatePrice(bp.id, parseInt(e.target.value) || 0)}
                      className="bg-transparent border-none p-0 w-full text-sm font-black text-white focus:ring-0 placeholder-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-600 font-black uppercase">Product Age</span>
                  <span className={`text-[10px] font-bold ${age >= 4 ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`}>
                    {age}年経過 {age >= 4 && ' (要更新)'}
                  </span>
                </div>
                {age >= 4 && (
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                )}
              </div>

              <button
                onClick={() => onRefresh(bp.id)}
                disabled={money < refreshCost}
                className={`w-full py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all ${
                  money < refreshCost 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                    : 'bg-emerald-600/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                <RefreshCcw size={12} />
                次世代モデル開発 (-${(refreshCost / 1000).toFixed(1)}M)
              </button>
            </Card>
          );
        })}

        {blueprints.length === 0 && (
          <div className="text-center p-12 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
            <div className="text-slate-700 font-black uppercase tracking-[0.2em] text-xs">No Design History</div>
          </div>
        )}
      </div>
    </div>
  );
};
