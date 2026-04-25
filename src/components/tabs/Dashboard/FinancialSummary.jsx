import React from 'react';
import { Landmark, RefreshCcw, Briefcase } from 'lucide-react';
import { Card, StatItem } from '../../ui/index.js';

/**
 * 財務サマリーコンポーネント
 */
export const FinancialSummary = ({ 
  stockPrice, money, profit, yenRate, playerEquity,
  onBuyBack, onSellEquity 
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-700/50 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <Landmark size={28} />
          </div>
          <div>
            <div className="text-slate-500 text-[10px] font-black tracking-widest uppercase mb-1">自社株価</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">${Math.floor(stockPrice)}</div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onBuyBack}
            className="px-6 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-white rounded-xl font-black text-xs transition-all border border-slate-200 dark:border-slate-700 shadow-lg"
          >
            <RefreshCcw className="inline mr-2 text-indigo-500" size={16} /> 10%買戻し
          </button>
          <button
            onClick={onSellEquity}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs transition-all shadow-lg shadow-indigo-600/20"
          >
            <Briefcase className="inline mr-2" size={16} /> 10%売却
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatItem 
          label="手元資金" 
          value={`$${Math.floor(money).toLocaleString()}k`} 
          trendColor={money < 0 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'}
        />
        <StatItem 
          label="週間利益" 
          value={`${profit >= 0 ? '+' : ''}$${Math.floor(profit).toLocaleString()}k`}
          trendColor={profit >= 0 ? 'text-cyan-400' : 'text-red-500'}
        />
        <StatItem 
          label="為替レート" 
          value={`1$ = ${Math.floor(yenRate)}円`}
          trendColor="text-blue-400"
        />
        <StatItem 
          label="株式保有率" 
          value={`${playerEquity}%`}
          trendColor="text-yellow-500"
        />
      </div>
    </Card>
  );
};
