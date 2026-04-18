import React from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { Network, TrendingUp, AlertCircle, Wrench, ShieldCheck, Briefcase } from 'lucide-react';

export default function Organization() {
  const { 
    divisions, updateDivisionBudgetShare, 
    orgStructure, updateBudgetAllocation, 
    currentEffects, spinOffDivision, sellSubsidiary,
    money, leadershipPower, markets
  } = useGame();
  
  const activeDivisions = Object.entries(divisions).filter(([_, div]) => div.active);

  const getSalePrice = (div) => {
    if (!div) return 0;
    const orgValue = div.level * 50000;
    const totalShare = Object.values(markets).reduce((sum, m) => sum + (m.shares.player || 0), 0);
    const shareValue = (totalShare / 3) * 1000000;
    return Math.floor((orgValue + shareValue) * 1.5);
  };
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* ... 組織ステータス部分はそのまま ... */}
      {/* 組織ステータス & 予算配分 */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <h2 className="text-xl font-black mb-2 flex items-center gap-2">
          <Network className="text-blue-400" />
          組織統治
        </h2>
        <div className="text-[10px] text-slate-400 mb-6 uppercase tracking-wider font-bold">
          Corporate Governance & Efficiency
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左側: 全体予算 */}
          <div className="space-y-5">
            {Object.entries(orgStructure.departments).map(([key, dept]) => {
              const budget = orgStructure.budgetAllocation || { rnd: 50, production: 50, marketing: 50, hr: 50 };
              const val = budget[key];
              const delta = (val - 50) * 20;
              return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                  <span className="font-bold flex items-center gap-1.5 uppercase">
                    {key === 'hr' && <ShieldCheck size={12} className="text-blue-400" />}
                    {dept.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {delta !== 0 && (
                      <span className={`text-[9px] font-bold ${delta > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {delta > 0 ? '+' : ''}{delta.toLocaleString()}k/tick
                      </span>
                    )}
                    <span className={`font-black ${val > 50 ? 'text-cyan-400' : val < 50 ? 'text-amber-400' : 'text-slate-400'}`}>{val}%</span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max="100" value={val}
                  onChange={(e) => updateBudgetAllocation(key, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )})}
          </div>

          {/* 右側: 組織健全性サマリー */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-center space-y-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-slate-400 uppercase">サイロ化リスク</span>
              <span className={`text-sm font-black ${orgStructure.siloRisk > 60 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                {Math.floor(orgStructure.siloRisk)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${orgStructure.siloRisk > 60 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${orgStructure.siloRisk}%` }} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="text-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="text-[9px] text-slate-500 font-bold uppercase">生産性</div>
                <div className="text-sm font-black text-emerald-400">x{currentEffects.orgProductivity?.toFixed(2)}</div>
              </div>
              <div className="text-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                <div className="text-[9px] text-slate-500 font-bold uppercase">革新性</div>
                <div className="text-sm font-black text-purple-400">x{currentEffects.orgInnovation?.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 事業部セクション */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <Briefcase className="text-indigo-400" />
          事業ポートフォリオ
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
          {activeDivisions.map(([key, div]) => (
            <div key={key} className={`rounded-2xl border transition-all p-5 relative group ${
              div.isSubsidiary 
                ? 'bg-indigo-900/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}>
              {div.isSubsidiary && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-[9px] font-black text-white rounded-bl-xl uppercase tracking-widest shadow-lg">
                  Independent Subsidiary
                </div>
              )}

              <div className="flex justify-between items-start mb-5">
                <div>
                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                    {div.name}
                    {div.isSubsidiary && <ShieldCheck size={16} className="text-indigo-400" />}
                  </h4>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                    Level {div.level} Division • {div.isSubsidiary ? '独立採算制' : '本社直轄'}
                  </div>
                </div>

                {!div.isSubsidiary && div.level >= 5 && (
                  <button
                    onClick={() => spinOffDivision(key)}
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

                {div.isSubsidiary && (
                  <button
                    onClick={() => sellSubsidiary(key)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95"
                  >
                    事業売却 (+${getSalePrice(div).toLocaleString()}k)
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>社内予算シェア</span>
                    <span className="text-indigo-400 font-black">{div.budgetShare}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="50" value={div.budgetShare}
                    onChange={(e) => updateDivisionBudgetShare(key, parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">事業部士気</div>
                    <div className={`text-sm font-black ${div.morale > 70 ? 'text-emerald-400' : div.morale < 40 ? 'text-red-400' : 'text-slate-200'}`}>
                      {Math.floor(div.morale)}%
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                    <div className="text-[9px] text-slate-500 font-bold uppercase">レベル効果</div>
                    <div className="text-[10px] font-bold text-slate-400">
                      品質上限 +{div.level * 2}%<br/>製造費 -{div.level}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
