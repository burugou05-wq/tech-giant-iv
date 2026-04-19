import React from 'react';
import { X, TrendingUp, BarChart2, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext.jsx';
import { AI_COMPANIES } from '../constants/index.js';

export default function CompanyDetailPanel({ companyId, onClose }) {
  const { markets, stockPrice, aiProducts, currentYear } = useGame();
  
  if (!companyId || companyId === 'player') return null;
  
  const ai = AI_COMPANIES[companyId];
  if (!ai) return null;

  const getCompanyStock = (id) => {
    const base = AI_COMPANIES[id]?.stockBase || 100;
    const appeal = aiProducts[id]?.appeal || 1;
    return Math.floor(base * (0.8 + appeal / 60));
  };

  const getCompanyRevenue = (id) => {
    const base = AI_COMPANIES[id]?.revenueBase || 50000;
    const totalShare = Object.values(markets).reduce((sum, m) => sum + (m.shares[id] || 0), 0);
    const years = Math.max(0, currentYear - 1946);
    return Math.floor(base * (0.5 + totalShare) * (1 + years * 0.008));
  };

  const getTotalShare = (id) => {
    const marketList = Object.values(markets).filter(m => !m.locked);
    if (marketList.length === 0) return 0;
    return marketList.reduce((sum, m) => sum + (m.shares[id] || 0), 0) / marketList.length;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end pointer-events-none">
      <div 
        className="pointer-events-auto w-full max-w-md h-full bg-slate-900 border-l border-slate-700 shadow-2xl overflow-y-auto animate-slide-in-right"
        style={{ animation: 'slideInRight 0.25s ease-out' }}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className={`w-4 h-4 rounded-full ${ai.color}`} />
            <h2 className="text-xl font-black text-white">{ai.name}</h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 ${ai.textColor}`}>{ai.trait}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* 基本データ */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={40} />
            </div>
            <p className="text-xs text-indigo-300/80 italic leading-relaxed relative z-10">
              "{ai.trait}として知られる{ai.name}は、{ai.strengths[0]}などを武器に市場で独自の地位を築いています。"
            </p>
          </div>

          {/* 株価・売上 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <TrendingUp size={12} className="text-indigo-400" /> 推定株価
              </div>
              <div className="text-2xl font-black text-white">${getCompanyStock(companyId).toLocaleString()}</div>
              <div className="text-[9px] text-slate-500 mt-1 font-bold">自社比: {((getCompanyStock(companyId) / stockPrice) * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <BarChart2 size={12} className="text-emerald-400" /> 推定売上
              </div>
              <div className="text-2xl font-black text-emerald-400">${(getCompanyRevenue(companyId) / 1000).toFixed(0)}M</div>
              <div className="text-[9px] text-slate-500 mt-1 font-bold">年間予測</div>
            </div>
          </div>

          {/* 現在の主力製品 */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-white opacity-[0.03] rotate-12">
              <Package size={100} />
            </div>
            <div className="flex items-center gap-2 text-slate-200 text-sm font-black mb-4">
              <Zap size={16} className="text-yellow-400" /> 現在の主力製品
            </div>
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-700/50">
                <div className={`text-lg font-black ${ai.textColor} leading-none mb-1`}>
                  {aiProducts[companyId]?.productName || '研究開発中'}
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Current Flagship Model</div>
                
                <div className="mt-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">製品魅力度 (Appeal)</span>
                    <span className="text-sm font-black text-white">{Math.floor(aiProducts[companyId]?.appeal || 0)}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (aiProducts[companyId]?.appeal || 0) * 1.5)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 強みセクション */}
          <div className="space-y-3">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Strengths & Core Competencies</div>
            <div className="grid gap-2">
              {ai.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 text-xs text-slate-300">
                  <div className={`w-1.5 h-1.5 rounded-full ${ai.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* 歴史タイムライン */}
          <div className="space-y-4">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Historical Milestones</div>
            <div className="relative pl-4 space-y-6 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {ai.history.map((h, i) => (
                <div key={i} className="relative pl-8">
                  <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 ${ai.color} z-10`} />
                  <div className="text-[10px] font-black text-slate-500 mb-0.5">{h.year}</div>
                  <div className="text-xs font-bold text-white mb-1">{h.product}</div>
                  <div className="text-[10px] text-slate-400 leading-relaxed">{h.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 地域別市場シェア */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">

          <div className="text-center pt-4">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
              Data compiled by Imperial Market Research Institute
            </p>
          </div>
        </div>
      </div>
      
      {/* 背景クリックで閉じるためのオーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto z-[-1]" 
        onClick={onClose}
      />
    </div>
  );
}
