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
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-black text-slate-400 text-sm uppercase tracking-widest flex items-center gap-2">
          Design Archive <span className="text-slate-600">({blueprints.length})</span>
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-24">
        {[...blueprints].reverse().map(bp => {
          const age = currentYear - (bp.launchYear || currentYear);
          const refreshCost = Math.max(8000, bp.cost * 3);
          const isUsedInProduction = productionLines.some(l => l.blueprintId === bp.id);
          
          const currentApp = calculateEffectiveAppeal(bp, currentYear, contentOwned, currentEffects);
          const appealLoss = bp.baseAppeal - Math.floor(currentApp);

          return (
            <Card key={bp.id} className="p-6 bg-slate-900/60 border-slate-800 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
              {/* 背景の装飾デコレーション */}
              <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none font-black text-6xl italic group-hover:opacity-[0.07] transition-opacity">
                {bp.generation || 1}
              </div>

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-black text-yellow-500 text-xl tracking-tight group-hover:text-yellow-400 transition-colors">
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

              {/* 統計グリッド */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/50">
                  <div className="text-[8px] text-slate-500 font-black uppercase mb-1">累計販売台数</div>
                  <div className="text-lg font-black text-emerald-400">
                    {(bp.totalSold || 0).toLocaleString()} <span className="text-[10px] text-slate-600">units</span>
                  </div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/50">
                  <div className="text-[8px] text-slate-500 font-black uppercase mb-1">現在の魅力度</div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-lg font-black text-white">{Math.floor(currentApp)}</div>
                    {appealLoss > 0 && (
                      <div className="text-[10px] font-bold text-rose-500 flex items-center">
                        <TrendingDown size={10} /> {appealLoss}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-600 font-black uppercase">製造原価 / 市場価格</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">${bp.cost}k</span>
                    <span className="text-slate-700">→</span>
                    <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      <span className="text-xs font-black text-emerald-400">$</span>
                      <input 
                        type="number"
                        value={bp.price}
                        onChange={(e) => onUpdatePrice(bp.id, parseInt(e.target.value) || 0)}
                        className="bg-transparent border-none p-0 w-16 text-xs font-black text-white focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-600 font-black uppercase">製品の鮮度</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${age >= 4 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>
                      {age}年経過
                    </span>
                    {age >= 4 && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRefresh(bp.id)}
                disabled={money < refreshCost}
                className={`w-full py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all ${
                  money < refreshCost 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500'
                }`}
              >
                <RefreshCcw size={12} />
                次世代モデルを開発して更新 (-${(refreshCost / 1000).toFixed(1)}M)
              </button>
            </Card>
          );
        })}

        {blueprints.length === 0 && (
          <div className="text-center p-12 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl col-span-2">
            <div className="text-slate-700 font-black uppercase tracking-[0.2em] text-xs">No Design History</div>
          </div>
        )}
      </div>
    </div>
  );
};
