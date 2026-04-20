import React from 'react';
import { Factory } from 'lucide-react';
import { Card } from '../../ui/index.js';

export const FactorySummary = ({ 
  totalUsedFactories, 
  totalFactories, 
  totalProduction, 
  estimatedDemand, 
  money, 
  onExpand, 
  onClose,
  onAddLine 
}) => {
  const supplyRatio = estimatedDemand > 0 ? totalProduction / estimatedDemand : 0;
  const expansionCost = 20000;
  const canClose = totalFactories > totalUsedFactories;

  return (
    <Card className="p-6 bg-slate-800 border-slate-700 shadow-lg flex flex-wrap justify-between items-center gap-6">
      <div className="space-y-1">
        <h3 className="text-xl font-black text-white flex items-center gap-3">
          <Factory size={28} className="text-blue-400" /> 工場統括
        </h3>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
          稼働中 {totalUsedFactories} / 総棟数: {totalFactories}
        </p>
      </div>

      <div className="flex items-center gap-8 bg-slate-900/40 p-4 rounded-2xl border border-slate-700/50">
        <div className="text-center">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mb-1">総生産量</div>
          <div className="text-xl font-black text-blue-400">{totalProduction.toLocaleString()}</div>
        </div>
        <div className="text-slate-700 text-lg font-black">/</div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mb-1">推定需要</div>
          <div className="text-xl font-black text-amber-400">{estimatedDemand.toLocaleString()}</div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${
          supplyRatio >= 0.9 && supplyRatio <= 1.3 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : supplyRatio < 0.9 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          {supplyRatio < 0.5 ? '⚠ 供給不足' : supplyRatio <= 1.3 ? '✓ 安定' : '⚠ 在庫過剰'}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onExpand}
          disabled={money < expansionCost}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${
            money >= expansionCost 
              ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:scale-105' 
              : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
          }`}
        >
          工場増設 (${(expansionCost / 1000).toFixed(1)}M)
        </button>
        <button
          onClick={onClose}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${
            canClose 
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:scale-105' 
              : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
          }`}
          title={canClose ? "余剰工場を閉鎖して資金を回収します" : "稼働中の工場は閉鎖できません"}
        >
          工場閉鎖
        </button>
        <button
          onClick={onAddLine}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
        >
          新規ライン追加
        </button>
      </div>
    </Card>
  );
};
