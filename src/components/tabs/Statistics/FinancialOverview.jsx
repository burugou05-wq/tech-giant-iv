import React from 'react';
import { Card } from '../../ui/index.js';
import { SparkLine } from '../../ui/Charts/SparkLine.jsx';
import { BarChart } from '../../ui/Charts/BarChart.jsx';

export const FinancialOverview = ({ chartData, lastTickProfit, profit, totalCost }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-slate-800 border-slate-700 shadow-xl">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">週間売上</div>
          <div className="text-2xl font-black text-emerald-400 mb-2">
            ${Math.floor(lastTickProfit.revenue).toLocaleString()}k
          </div>
          <SparkLine data={chartData} dataKey="revenue" color="#10b981" height={60} showArea={false} />
        </Card>
        
        <Card className="p-5 bg-slate-800 border-slate-700 shadow-xl">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">週間コスト</div>
          <div className="text-2xl font-black text-rose-400 mb-2">
            ${Math.floor(totalCost).toLocaleString()}k
          </div>
          <SparkLine data={chartData} dataKey="cost" color="#f43f5e" height={60} showArea={false} />
        </Card>
        
        <Card className="p-5 bg-slate-800 border-slate-700 shadow-xl">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">週間利益</div>
          <div className={`text-2xl font-black mb-2 ${profit >= 0 ? 'text-cyan-400' : 'text-rose-500'}`}>
            {profit >= 0 ? '+' : ''}${Math.floor(profit).toLocaleString()}k
          </div>
          <SparkLine data={chartData} dataKey="profit" color={profit >= 0 ? '#22d3ee' : '#f43f5e'} height={60} showArea={false} />
        </Card>
      </div>

      {/* 売上 vs コスト棒グラフ */}
      <Card className="p-6 bg-slate-800 border-slate-700 shadow-xl">
        <h3 className="font-black text-slate-300 text-sm mb-6 uppercase tracking-widest">売上 vs コスト 推移 (直近30期)</h3>
        <BarChart 
          data={chartData.slice(-30)} 
          keys={['revenue', 'cost']} 
          colors={['#10b981', '#f43f5e']}
          labels={['売上', 'コスト']} 
          height={160} 
        />
      </Card>
    </div>
  );
};
