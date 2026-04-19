import React from 'react';
import { Trophy, Crown } from 'lucide-react';
import { Card } from '../../ui/index.js';

export const RankingHeader = ({ currentYear, playerRank, totalCompanies }) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-900/30">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Trophy size={28} className="text-yellow-400" />
            世界企業ランキング
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            {currentYear}年 時価総額ベース
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Your Position</div>
          <div className={`text-5xl font-black tracking-tighter ${
            playerRank <= 3 ? 'text-yellow-400' : playerRank <= 5 ? 'text-indigo-400' : 'text-slate-400'
          }`}>
            {playerRank}<span className="text-lg text-slate-500 ml-1">位</span>
          </div>
          <div className="text-[10px] text-slate-500 font-bold">{totalCompanies}社中</div>
        </div>
      </div>

      {playerRank === 1 && (
        <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl flex items-center gap-4 animate-pulse">
          <div className="p-2 bg-yellow-400/20 rounded-full">
            <Crown size={24} className="text-yellow-400" />
          </div>
          <div>
            <div className="text-sm font-black text-yellow-400 uppercase tracking-widest">World Leader</div>
            <div className="text-xs text-yellow-200/70 font-medium">あなたの会社は現在、世界で最も価値のある企業です。</div>
          </div>
        </div>
      )}
    </Card>
  );
};
