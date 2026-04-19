import React, { useState } from 'react';
import { BarChart3, PieChart, Landmark, TrendingUp } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';

// 分割したコンポーネントのインポート
import { FinancialOverview } from './Statistics/FinancialOverview.jsx';
import { MarketAnalysis } from './Statistics/MarketAnalysis.jsx';
import { ProfitLossStatement } from './Statistics/ProfitLossStatement.jsx';
import { StockHistory } from './Statistics/StockHistory.jsx';

export default function Statistics() {
  const { 
    chartData, lastTickProfit, profit, totalCost, 
    markets, stockPrice, currentYear, divisions 
  } = useGame();
  
  const [subTab, setSubTab] = useState('financial');

  // サブタブ定義
  const TABS = [
    { id: 'financial', label: '財務概況', icon: <BarChart3 size={16} /> },
    { id: 'markets', label: '市場分析', icon: <PieChart size={16} /> },
    { id: 'pl', label: '損益計算書', icon: <Landmark size={16} /> },
    { id: 'stock', label: '株価・資産', icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      {/* 統計ナビゲーション */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-md self-center">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all uppercase tracking-widest ${
              subTab === tab.id 
                ? 'bg-slate-700 text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* メインコンテンツエリア */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {subTab === 'financial' && (
          <FinancialOverview 
            chartData={chartData}
            lastTickProfit={lastTickProfit}
            profit={profit}
            totalCost={totalCost}
          />
        )}

        {subTab === 'markets' && (
          <MarketAnalysis 
            markets={markets}
            chartData={chartData}
          />
        )}

        {subTab === 'pl' && (
          <ProfitLossStatement 
            lastTickProfit={lastTickProfit}
            profit={profit}
            totalCost={totalCost}
            divisions={divisions}
          />
        )}

        {subTab === 'stock' && (
          <StockHistory 
            chartData={chartData}
            stockPrice={stockPrice}
            currentYear={currentYear}
          />
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
