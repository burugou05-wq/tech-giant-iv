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
  
  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Design Archive <span className="text-slate-600 font-mono">[{blueprints.length}]</span>
        </h3>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto pr-3 custom-scrollbar flex-1 pb-32">
        {[...blueprints].reverse().map(bp => {
          const age = currentYear - (bp.launchYear || currentYear);
          const refreshCost = Math.max(8000, bp.cost * 3);
          const isUsedInProduction = productionLines.some(l => l.blueprintId === bp.id);
          
          const currentApp = calculateEffectiveAppeal(bp, currentYear, contentOwned, currentEffects);
          const appealLoss = bp.baseAppeal - Math.floor(currentApp);

          return (
            <Card key={bp.id} className="p-7 bg-slate-900/40 border-slate-800/80 hover:border-indigo-500/40 transition-all group relative overflow-hidden backdrop-blur-sm">
              {/* 背景の装飾デコレーション */}
              <div className="absolute -right-6 -bottom-6 opacity-[0.04] pointer-events-none font-black text-8xl italic group-hover:opacity-[0.08] transition-all group-hover:-translate-y-2">
                {bp.generation || 1}
              </div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="font-black text-yellow-500 text-2xl tracking-tight group-hover:text-yellow-400 transition-colors flex items-center gap-3">
                    {bp.name}
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase tracking-widest font-bold">Gen.{bp.generation || 1}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-widest">
                    Launched: {bp.launchYear} / {bp.category}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(bp.id)}
                  disabled={isUsedInProduction}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isUsedInProduction 
                      ? 'opacity-10 cursor-not-allowed bg-slate-800' 
                      : 'bg-slate-800/50 hover:bg-red-500/20 text-slate-600 hover:text-red-500 border border-slate-700/50'
                  }`}
                  title={isUsedInProduction ? '生産ラインで使用中のため削除できません' : '削除'}
                >
                  <X size={18} />
                </button>
              </div>

              {/* 統計グリッド */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/50 relative overflow-hidden group/stat">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-wider">累計販売台数</div>
                  <div className="text-xl font-black text-emerald-400 flex items-baseline gap-1">
                    {(bp.totalSold || 0).toLocaleString()} <span className="text-xs text-slate-600 font-bold uppercase">units</span>
                  </div>
                  <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500/20" />
                </div>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/50 relative overflow-hidden group/stat">
                  <div className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-wider">現在の魅力度</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-xl font-black text-white">{Math.floor(currentApp)}</div>
                    {appealLoss > 0 && (
                      <div className="text-xs font-bold text-rose-500 flex items-center gap-0.5">
                        <TrendingDown size={12} /> {appealLoss}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 px-1">
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">製造原価 / 市場価格</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 font-mono">${bp.cost}k</span>
                    <span className="text-slate-700">→</span>
                    <div className="flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                      <span className="text-sm font-black text-emerald-500">$</span>
                      <input 
                        type="number"
                        value={bp.price}
                        onChange={(e) => onUpdatePrice(bp.id, parseInt(e.target.value) || 0)}
                        className="bg-transparent border-none p-0 w-20 text-sm font-black text-white focus:ring-0 font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-right">
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">製品の鮮度</div>
                  <div className="flex items-center justify-end gap-3">
                    <span className={`text-sm font-black tracking-tight ${age >= 4 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
                      発売から {age} 年経過
                    </span>
                    {age >= 4 && <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.6)]" />}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRefresh(bp.id)}
                disabled={money < refreshCost}
                className={`w-full py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-3 transition-all ${
                  money < refreshCost 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                    : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <RefreshCcw size={14} />
                次世代モデルの開発を承認 (-${(refreshCost / 1000).toFixed(1)}M)
              </button>
            </Card>
          );
        })}

        {blueprints.length === 0 && (
          <div className="text-center p-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[32px] col-span-full">
            <div className="text-slate-700 font-black uppercase tracking-[0.4em] text-sm">Design Archive Empty</div>
          </div>
        )}
      </div>
    </div>
  );
};
