import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext.jsx';

/**
 * 簡易化された世界地図コンポーネント
 * SVGパスを使用して主要な4市場をインタラクティブに表示
 */
const WorldMap = ({ activeMarket, onSelectMarket }) => {
  const { markets } = useGame();

  // 各市場のスタイル（シェアに応じた輝きなど）
  const getRegionStyle = (mKey) => {
    const m = markets[mKey];
    if (!m) return { fill: '#1e293b' };
    if (m.locked) return { fill: '#0f172a', stroke: '#334155', opacity: 0.5 };
    
    // シェアが高いほど明るいグリーン/ブルーに
    const share = m.shares.player || 0;
    const brightness = Math.min(100, 30 + share * 200);
    const color = mKey === activeMarket ? `rgb(79, 70, 229)` : `rgb(30, 41, 59)`;
    const strokeColor = mKey === activeMarket ? '#818cf8' : '#475569';
    
    return {
      fill: color,
      stroke: strokeColor,
      strokeWidth: mKey === activeMarket ? 3 : 1,
      transition: 'all 0.3s ease'
    };
  };

  return (
    <div className="w-full bg-slate-950/40 rounded-3xl p-6 border border-slate-800 shadow-inner overflow-hidden relative">
      <div className="absolute top-4 left-6">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Market Presence</h4>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-slate-300">リアルタイム戦略マップ</span>
        </div>
      </div>

      <svg viewBox="0 0 800 400" className="w-full h-auto drop-shadow-2xl">
        {/* 背景のグリッド */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="800" height="400" fill="url(#grid)" />

        {/* 欧州 (EU) */}
        <g 
          className="cursor-pointer group" 
          onClick={() => onSelectMarket('eu')}
        >
          <path 
            d="M 380 120 L 420 110 L 450 130 L 440 160 L 410 180 L 380 170 Z" 
            {...getRegionStyle('eu')}
            className="hover:brightness-125"
          />
          <text x="415" y="145" className="fill-slate-400 text-[10px] font-bold pointer-events-none group-hover:fill-white">EU</text>
        </g>

        {/* 北米 (NA) */}
        <g 
          className="cursor-pointer group" 
          onClick={() => onSelectMarket('na')}
        >
          <path 
            d="M 100 110 L 250 100 L 280 180 L 200 250 L 120 200 Z" 
            {...getRegionStyle('na')}
            className="hover:brightness-125"
          />
          <text x="180" y="160" className="fill-slate-400 text-[10px] font-bold pointer-events-none group-hover:fill-white">NORTH AMERICA</text>
        </g>

        {/* 中国 (CN) */}
        <g 
          className="cursor-pointer group" 
          onClick={() => onSelectMarket('cn')}
        >
          <path 
            d="M 580 150 L 650 160 L 660 210 L 600 230 L 570 200 Z" 
            {...getRegionStyle('cn')}
            className="hover:brightness-125"
          />
          <text x="615" y="195" className="fill-slate-400 text-[10px] font-bold pointer-events-none group-hover:fill-white">CHINA</text>
        </g>

        {/* 日本 (JP) */}
        <g 
          className="cursor-pointer group" 
          onClick={() => onSelectMarket('jp')}
        >
          <circle 
            cx="700" cy="180" r="15" 
            {...getRegionStyle('jp')}
            className="hover:brightness-125"
          />
          <text x="690" y="210" className="fill-slate-400 text-[10px] font-bold pointer-events-none group-hover:fill-white">JAPAN</text>
          {/* 日本を強調するリング */}
          <circle cx="700" cy="180" r="22" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow" />
        </g>

        {/* 供給ライン（演出用の動く線） */}
        {!markets.na.locked && (
          <path 
            d="M 685 180 Q 500 150 280 160" 
            fill="none" stroke="rgba(129, 140, 248, 0.3)" strokeWidth="2" strokeDasharray="5 5"
            className="animate-dash"
          />
        )}
      </svg>

      {/* 凡例・ミニステータス */}
      <div className="mt-4 flex justify-center gap-6">
        {Object.entries(markets).map(([key, m]) => (
          <div key={key} className={`flex items-center gap-2 px-3 py-1 rounded-full border ${activeMarket === key ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{key}</span>
            <span className="text-[10px] font-black text-white">{(m.shares.player * 100).toFixed(1)}%</span>
            {m.locked && <span className="text-[8px]">🔒</span>}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        .animate-spin-slow {
          transform-origin: 700px 180px;
          animation: spin-slow 10s linear infinite;
        }
        .animate-dash {
          stroke-dasharray: 10;
          animation: dash 1s linear infinite;
        }
      `}} />
    </div>
  );
};

export default WorldMap;
