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

        <div className="p-6 space-y-6">
          {/* 基本データ */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl">
            <p className="text-xs text-indigo-300/70 italic leading-relaxed">
              "{ai.desc}"
            </p>
          </div>

          {/* 株価・売上 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <TrendingUp size={12} /> 推定株価
              </div>
              <div className="text-2xl font-black text-white">${getCompanyStock(companyId).toLocaleString()}</div>
              <div className="text-[10px] text-slate-500 mt-1 font-bold">自社: ${Math.floor(stockPrice)}</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <BarChart2 size={12} /> 推定売上
              </div>
              <div className="text-2xl font-black text-emerald-400">${(getCompanyRevenue(companyId) / 1000).toFixed(0)}M</div>
              <div className="text-[10px] text-slate-500 mt-1 font-bold">年間換算</div>
            </div>
          </div>

          {/* 市場シェア */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg">
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
                    <div className="flex justify-between text-[9px] font-medium text-slate-600 mt-1">
                      <span>{ai.name}</span>
                      <span className="text-green-500/60">自社: {playerShare.toFixed(1)}%</span>
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

          {/* 戦略と製品 */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-black mb-4">
              <Zap size={16} className="text-yellow-400" /> 競合分析
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">現在の注力製品アピール力</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-950 rounded-full h-4 border border-slate-700 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (aiProducts[companyId]?.appeal || 0) * 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-white">{Math.floor(aiProducts[companyId]?.appeal || 0)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700/50">
                  <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">主要戦略</div>
                  <div className="text-xs font-bold text-slate-200">{ai.trait}</div>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-700/50">
                  <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">登場時期</div>
                  <div className="text-xs font-bold text-slate-200">{ai.appearsYear}年</div>
                </div>
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
