import React from 'react';
import { Card } from '../../ui/index.js';

export const ProfitLossStatement = ({ lastTickProfit, profit, totalCost, divisions }) => {
  const costBreakdown = [
    { label: '変動費（材料・製造）', value: lastTickProfit.varCost, color: 'bg-rose-500' },
    { label: '固定費（工場維持）', value: lastTickProfit.fixedCost, color: 'bg-orange-500' },
    { label: 'マーケティング費', value: lastTickProfit.marketingCost, color: 'bg-blue-500' },
    { label: '直営店運営費', value: lastTickProfit.storeCost, color: 'bg-indigo-500' },
    { label: 'リコール・修理費', value: lastTickProfit.repairCost, color: 'bg-pink-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* コスト内訳 */}
      <Card className="p-8 bg-slate-800 border-slate-700 shadow-xl">
        <h3 className="font-black text-slate-300 text-sm mb-8 uppercase tracking-widest">週間コスト内訳</h3>
        <div className="space-y-6">
          {costBreakdown.map(item => {
            const pct = totalCost > 0 ? (item.value / totalCost) * 100 : 0;
            return (
              <div key={item.label} className="group">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500 font-bold uppercase tracking-tight group-hover:text-slate-300 transition-colors">{item.label}</span>
                  <span className="text-white font-black tracking-tight">${Math.floor(item.value).toLocaleString()}k <span className="text-[10px] text-slate-600 ml-1">({pct.toFixed(1)}%)</span></span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900 p-0.5 shadow-inner">
                  <div 
                    className={`${item.color} h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.05)]`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 損益計算書 (P/L) */}
      <Card className="p-8 bg-slate-800 border-slate-700 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none font-black text-6xl italic">PROFIT & LOSS</div>
        <h3 className="font-black text-slate-300 text-sm mb-8 uppercase tracking-widest">週次損益計算書 (P/L)</h3>
        <div className="bg-slate-950/40 rounded-2xl border border-slate-800/80 overflow-hidden shadow-inner">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-800/50">
              <tr>
                <td className="p-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">売上高 (REVENUE)</td>
                <td className="p-4 text-right text-emerald-400 font-black text-lg tracking-tight">${Math.floor(lastTickProfit.revenue).toLocaleString()}k</td>
              </tr>
              {lastTickProfit.b2b > 0 && (
                <tr className="bg-slate-900/20">
                  <td className="p-3 text-slate-500 pl-8 font-bold text-[9px] uppercase italic">└ B2B Procurement</td>
                  <td className="p-3 text-right text-slate-500 font-bold text-xs">${Math.floor(lastTickProfit.b2b).toLocaleString()}k</td>
                </tr>
              )}
              <tr>
                <td className="p-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">売上原価 / 変動費 (COGS)</td>
                <td className="p-4 text-right text-rose-500/80 font-bold">-${Math.floor(lastTickProfit.varCost).toLocaleString()}k</td>
              </tr>
              <tr className="bg-slate-900/30">
                <td className="p-4 text-slate-300 font-black uppercase tracking-widest text-xs">売上総利益 (GROSS MARGIN)</td>
                <td className={`p-4 text-right font-black text-base ${lastTickProfit.revenue - lastTickProfit.varCost >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  ${Math.floor(lastTickProfit.revenue - lastTickProfit.varCost).toLocaleString()}k
                </td>
              </tr>
              <tr>
                <td className="p-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">販売費・一般管理費 (SGA)</td>
                <td className="p-4 text-right text-rose-500/80 font-bold">-${Math.floor(totalCost - lastTickProfit.varCost).toLocaleString()}k</td>
              </tr>
              <tr className="bg-slate-900 shadow-xl">
                <td className="p-5 text-white font-black uppercase tracking-widest text-sm">純利益 (NET INCOME)</td>
                <td className={`p-5 text-right text-2xl font-black tracking-tighter ${profit >= 0 ? 'text-cyan-400' : 'text-rose-500'}`}>
                  {profit >= 0 ? '+' : ''}${Math.floor(profit).toLocaleString()}k
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
