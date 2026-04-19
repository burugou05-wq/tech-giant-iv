import React from 'react';
import { TrendingUp, DollarSign, Zap, AlertCircle } from 'lucide-react';
import { AI_COMPANIES } from '../../../constants/index.js';

/**
 * 市場ごとの競合比較コンポーネント
 * @param {Object} props
 * @param {Object} props.market - 市場データ
 * @param {Object} props.aiProducts - AI製品データ
 * @param {Object} props.playerBest - プレイヤーの最良製品データ
 */
export const MarketRivalry = ({ market, aiProducts, playerBest }) => {
  if (market.locked) return null;

  // 1. その市場でのトップライバルを特定 (自社を除く最大シェア)
  const rivalId = Object.entries(market.shares)
    .filter(([id]) => id !== 'player')
    .reduce((prev, [id, share]) => (share > (prev?.share || 0) ? { id, share } : prev), { id: null, share: 0 })
    .id;

  const rival = AI_COMPANIES[rivalId];
  const rivalProduct = aiProducts[rivalId];

  if (!rival || !rivalProduct) return null;

  // 2. プレイヤー製品とライバル製品の比較データ
  const metrics = [
    { 
      label: '魅力度 (Appeal)', 
      icon: <Zap size={12} className="text-yellow-400" />,
      player: playerBest?.app || 0,
      rival: rivalProduct.appeal,
      unit: ''
    },
    { 
      label: '実売価格 (Price)', 
      icon: <DollarSign size={12} className="text-emerald-400" />,
      player: playerBest?.bp?.price || 0,
      rival: rivalProduct.price,
      unit: '$',
      lowerIsBetter: true
    },
    { 
      label: 'コスパ (Efficiency)', 
      icon: <TrendingUp size={12} className="text-indigo-400" />,
      player: (playerBest?.app || 0) / ((playerBest?.bp?.price || 1) / 100),
      rival: rivalProduct.appeal / (rivalProduct.price / 100),
      unit: 'pt'
    }
  ];

  return (
    <div className="mt-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">地域最大ライバル分析</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold ${rival.textColor}`}>{rival.name}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${rival.color}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* プレイヤー側 */}
        <div className="space-y-1">
          <div className="text-[9px] text-slate-500 font-bold uppercase">自社最新モデル</div>
          <div className="text-xs font-black text-white truncate">{playerBest?.bp?.name || '製品なし'}</div>
        </div>
        {/* ライバル側 */}
        <div className="space-y-1 text-right">
          <div className="text-[9px] text-slate-500 font-bold uppercase">ライバル旗艦機</div>
          <div className="text-xs font-black text-slate-300 truncate">{rivalProduct.name}</div>
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((m, i) => {
          const isBetter = m.lowerIsBetter ? m.player < m.rival : m.player > m.rival;
          const isDraw = Math.abs(m.player - m.rival) < 0.1;
          
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase">
                <div className="flex items-center gap-1">{m.icon} {m.label}</div>
                <div className="flex gap-4">
                  <span className={isBetter ? 'text-emerald-400' : isDraw ? 'text-slate-400' : 'text-rose-400'}>
                    {m.unit}{Math.floor(m.player)}
                  </span>
                  <span className="text-slate-600">vs</span>
                  <span className={!isBetter && !isDraw ? 'text-emerald-400' : isDraw ? 'text-slate-400' : 'text-slate-500'}>
                    {m.unit}{Math.floor(m.rival)}
                  </span>
                </div>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full flex overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isBetter ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                  style={{ width: `${(m.player / (m.player + m.rival || 1)) * 100}%` }} 
                />
                <div className="w-0.5 bg-slate-800 h-full" />
                <div 
                  className={`h-full transition-all duration-1000 ${!isBetter && !isDraw ? 'bg-emerald-500' : 'bg-slate-700'}`} 
                  style={{ width: `${(m.rival / (m.player + m.rival || 1)) * 100}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
