import React from 'react';
import { Crown, Medal, Award } from 'lucide-react';

const getRankIcon = (rank) => {
  if (rank === 1) return <Crown size={20} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />;
  if (rank === 2) return <Medal size={18} className="text-slate-300" />;
  if (rank === 3) return <Award size={18} className="text-amber-600" />;
  return <span className="text-slate-600 font-black text-xs w-5 text-center">{rank}</span>;
};

const getRankBg = (rank, isPlayer) => {
  if (isPlayer) return 'bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.05)]';
  if (rank === 1) return 'bg-yellow-400/5 border-yellow-400/20';
  if (rank === 2) return 'bg-slate-800/60 border-slate-700/50';
  if (rank === 3) return 'bg-amber-700/5 border-amber-700/20';
  return 'bg-slate-900/40 border-slate-800/50';
};

export const RankingRow = ({ company, rank, maxMarketCap, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
        !company.isPlayer ? 'cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/80 group' : ''
      } ${getRankBg(rank, company.isPlayer)}`}
    >
      {/* 順位アイコン */}
      <div className="w-8 flex justify-center shrink-0">
        {getRankIcon(rank)}
      </div>

      {/* 企業名とインジケーター */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-1 h-8 rounded-full shrink-0 ${company.color} opacity-80`} />
        <div className="min-w-0">
          <div className={`font-black text-sm truncate tracking-tight ${company.isPlayer ? 'text-green-400' : 'text-white group-hover:text-indigo-300'}`}>
            {company.name}
          </div>
          {company.isPlayer && (
            <div className="text-[8px] text-green-500 font-black uppercase tracking-widest mt-0.5">Your Empire</div>
          )}
        </div>
      </div>

      {/* 財務数値 */}
      <div className="flex gap-8 items-center">
        <div className="text-right shrink-0">
          <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Market Cap</div>
          <div className={`text-sm font-black ${company.isPlayer ? 'text-green-400' : 'text-white'}`}>
            ${(company.marketCap / 1000).toFixed(0)}<span className="text-[10px] ml-0.5 opacity-50">M</span>
          </div>
        </div>

        <div className="text-right shrink-0 hidden md:block">
          <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Est. Revenue</div>
          <div className="text-sm font-bold text-slate-400">
            ${(company.revenue / 1000).toFixed(0)}<span className="text-[10px] ml-0.5 opacity-50">M</span>
          </div>
        </div>

        {/* 比較バー */}
        <div className="w-20 shrink-0 hidden lg:block">
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${company.isPlayer ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : company.color}`}
              style={{ width: `${Math.min(100, (company.marketCap / maxMarketCap) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
