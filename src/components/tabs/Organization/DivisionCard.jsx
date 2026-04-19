import React from 'react';
import { ShieldCheck, Briefcase } from 'lucide-react';

export const DivisionCard = ({ 
  divisionKey, 
  division, 
  money, 
  leadershipPower, 
  onUpdateBudget, 
  onSpinOff, 
  onSell, 
  salePrice 
}) => {
  const { name, level, budgetShare, morale, isSubsidiary } = division;
  
  return (
    <div className={`rounded-2xl border transition-all duration-300 p-6 relative group ${
      isSubsidiary 
        ? 'bg-indigo-900/10 border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.08)]' 
        : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
    }`}>
      {isSubsidiary && (
        <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-600 text-[9px] font-black text-white rounded-bl-2xl uppercase tracking-[0.2em] shadow-lg">
          Independent Subsidiary
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-xl font-black text-white flex items-center gap-3">
            {name}
            {isSubsidiary && <ShieldCheck size={18} className="text-indigo-400" />}
          </h4>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            Level {level} Division • <span className={isSubsidiary ? 'text-indigo-400' : 'text-slate-400'}>
              {isSubsidiary ? '独立採算制' : '本社直轄'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {!isSubsidiary && level >= 5 && (
            <button
              onClick={() => onSpinOff(divisionKey)}
              disabled={money < 100000 || leadershipPower < 100}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-xl ${
                money >= 100000 && leadershipPower >= 100
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 active:scale-95'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              子会社化 ($100M / 100LP)
            </button>
          )}

          {isSubsidiary && (
            <button
              onClick={() => onSell(divisionKey)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600 border border-red-500/50 text-red-400 hover:text-white text-[10px] font-black rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              事業売却 (+${salePrice.toLocaleString()}k)
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* 予算シェアスライダー */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>社内予算シェア</span>
            <span className="text-indigo-400 text-sm">{budgetShare}%</span>
          </div>
          <input 
            type="range" min="5" max="50" value={budgetShare}
            onChange={(e) => onUpdateBudget(divisionKey, parseInt(e.target.value))}
            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 border border-slate-900"
          />
        </div>

        {/* ステータスグリッド */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">事業部士気</div>
            <div className={`text-lg font-black ${morale > 70 ? 'text-emerald-400' : morale < 40 ? 'text-red-400' : 'text-slate-200'}`}>
              {Math.floor(morale)}%
            </div>
            <div className="w-full bg-slate-900 h-1 mt-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ${morale > 70 ? 'bg-emerald-500' : morale < 40 ? 'bg-red-500' : 'bg-slate-600'}`} 
                style={{ width: `${morale}%` }} 
              />
            </div>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">事業部レベル効果</div>
            <div className="text-[10px] font-bold text-slate-400 leading-relaxed">
              品質上限 <span className="text-indigo-300">+{level * 2}%</span><br/>
              製造コスト <span className="text-emerald-300">-{level}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
