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
          {/* 1. 基本データ・企業スローガン */}
          <div className="p-5 bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border border-indigo-500/30 rounded-2xl relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Landmark size={80} />
            </div>
            <div className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-2">Corporate Profile</div>
            <p className="text-sm text-slate-200 font-medium leading-relaxed relative z-10">
              {ai.name}は{ai.trait}として知られ、<span className="text-indigo-300 font-bold">{ai.strengths[0]}</span>を核心的価値に据えています。
            </p>
          </div>

          {/* 2. 主要KPI（株価・売上） */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-xl group hover:border-indigo-500/50 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
                <TrendingUp size={12} className="text-indigo-400" /> Market Cap
              </div>
              <div className="text-2xl font-black text-white leading-none">${getCompanyStock(companyId).toLocaleString()}</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, (getCompanyStock(companyId) / stockPrice) * 50)}%` }} />
                </div>
              </div>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-xl group hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
                <BarChart2 size={12} className="text-emerald-400" /> Revenue
              </div>
              <div className="text-2xl font-black text-emerald-400 leading-none">${(getCompanyRevenue(companyId) / 1000).toFixed(0)}M</div>
              <div className="text-[9px] text-slate-500 mt-2 font-bold uppercase">Estimated Annual</div>
            </div>
          </div>

          {/* 3. 企業の強み (重要度高) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Core Competencies</div>
              <Zap size={14} className="text-yellow-500 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {ai.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors shadow-sm">
                  <div className={`shrink-0 w-2 h-2 rounded-full ${ai.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                  <span className="text-xs font-bold text-slate-200">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 現在の主力製品 (フラグシップ) */}
          <div className="bg-slate-950/80 rounded-2xl p-6 border-2 border-slate-800 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[50px] -z-10 group-hover:bg-indigo-600/20 transition-all" />
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-indigo-400" />
                <span className="text-xs font-black text-slate-300 uppercase tracking-tighter">Active Flagship</span>
              </div>
              <div className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-black rounded uppercase">In Market</div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className={`text-2xl font-black ${ai.textColor} tracking-tight leading-tight`}>
                  {aiProducts[companyId]?.productName || 'Classified'}
                </div>
                <div className="text-[9px] text-slate-500 font-bold uppercase mt-1">Product Designation</div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Market Appeal Score</span>
                  <span className="text-lg font-black text-white">{Math.floor(aiProducts[companyId]?.appeal || 0)}</span>
                </div>
                <div className="w-full bg-slate-900 h-3 rounded-full border border-slate-800 p-0.5 shadow-inner">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (aiProducts[companyId]?.appeal || 0) * 1.5)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. 歴史タイムライン */}
          <div className="space-y-5">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">Strategic Milestones</div>
            <div className="relative pl-4 space-y-8 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800/50">
              {ai.history.map((h, i) => (
                <div key={i} className="relative pl-10 group">
                  <div className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${ai.color} z-10 group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                  <div className="text-[10px] font-black text-indigo-400/70 mb-1">{h.year}</div>
                  <div className="text-sm font-black text-white mb-1.5">{h.product}</div>
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 text-[11px] text-slate-400 leading-relaxed">
                    {h.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 地域別市場シェア */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-black mb-4 pb-2 border-b border-slate-700">
              <BarChart2 size={16} className="text-indigo-400" /> 地域別市場シェア
            </div>
            <div className="space-y-4">
              {Object.entries(markets).filter(([, m]) => !m.locked).map(([mKey, m]) => {
                const share = (m.shares[companyId] || 0) * 100;
                const playerShare = m.shares.player * 100;
                return (
                  <div key={mKey}>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      <span>{m.name}</span>
                      <span className={ai.textColor}>{share.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden flex border border-slate-700/50 shadow-inner">
                      <div className={`${ai.color} h-full transition-all duration-1000`} style={{ width: `${share}%` }} />
                      <div className="bg-green-500/30 h-full border-l border-white/5" style={{ width: `${playerShare}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 mt-1 border-t border-slate-700 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase">平均占有率</span>
                <span className={`text-sm font-black ${ai.textColor}`}>{(getTotalShare(companyId) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

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
