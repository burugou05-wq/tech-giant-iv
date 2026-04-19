import React from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { Card } from '../../ui/index.js';
import { SparkLine } from '../../ui/Charts/SparkLine.jsx';

export const StockHistory = ({ chartData, stockPrice, currentYear }) => {
  return (
    <div className="space-y-8">
      <Card className="p-8 bg-slate-800 border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-white text-xl flex items-center gap-3">
              <TrendingUp size={24} className="text-indigo-400" /> 株価推移
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Market Capitalization History</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-indigo-400 tracking-tighter">${Math.floor(stockPrice)}</div>
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{currentYear}年 現在</div>
          </div>
        </div>

        <div className="bg-slate-950/40 p-4 rounded-3xl border border-slate-800/50 shadow-inner">
          <SparkLine 
            data={chartData} 
            dataKey="stockPrice" 
            color="#818cf8" 
            height={220} 
            label="株価"
            format={v => `$${Math.floor(v)}`} 
          />
        </div>
        
        <div className="flex justify-between text-[10px] text-slate-600 font-black uppercase tracking-widest mt-6 px-4">
          <span>Foundation ({chartData.length > 0 ? chartData[0].year : '---'})</span>
          <span>{currentYear} Current</span>
        </div>
      </Card>

      {/* 総資産推移 */}
      <Card className="p-8 bg-slate-800 border-slate-700 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <Activity size={20} className="text-emerald-400" />
          <h3 className="font-black text-white text-sm uppercase tracking-widest">総資産・キャッシュ推移</h3>
        </div>
        <div className="bg-slate-950/20 p-4 rounded-2xl border border-slate-800/30">
          <SparkLine 
            data={chartData} 
            dataKey="money" 
            color="#10b981" 
            height={140}
            format={v => `$${(v/1000).toFixed(0)}M`} 
          />
        </div>
      </Card>
    </div>
  );
};
