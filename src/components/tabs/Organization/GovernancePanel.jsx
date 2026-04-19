import React from 'react';
import { Network, ShieldCheck } from 'lucide-react';
import { Card } from '../../ui/index.js';

export const GovernancePanel = ({ orgStructure, currentEffects, updateBudgetAllocation }) => {
  return (
    <Card className="p-6 bg-slate-800 border-slate-700 shadow-xl">
      <h2 className="text-xl font-black mb-2 flex items-center gap-2">
        <Network className="text-blue-400" />
        組織統治
      </h2>
      <div className="text-[10px] text-slate-500 mb-6 uppercase tracking-widest font-black opacity-60">
        Corporate Governance & Internal Efficiency
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左側: 全体予算配分 */}
        <div className="space-y-6">
          {Object.entries(orgStructure.departments).map(([key, dept]) => {
            const budget = orgStructure.budgetAllocation || { rnd: 50, production: 50, marketing: 50, hr: 50 };
            const val = budget[key];
            const delta = (val - 50) * 20;
            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-black flex items-center gap-2 uppercase tracking-tight text-slate-300">
                    {key === 'hr' && <ShieldCheck size={14} className="text-blue-400" />}
                    {dept.name}
                  </span>
                  <div className="flex items-center gap-3">
                    {delta !== 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${delta > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {delta > 0 ? '+' : ''}{delta.toLocaleString()}k
                      </span>
                    )}
                    <span className={`font-black text-sm ${val > 50 ? 'text-cyan-400' : val < 50 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {val}%
                    </span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max="100" value={val}
                  onChange={(e) => updateBudgetAllocation(key, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 border border-slate-800"
                />
              </div>
            );
          })}
        </div>

        {/* 右側: 組織健全性 */}
        <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50 flex flex-col justify-center space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">サイロ化リスク</span>
              <span className={`text-sm font-black ${orgStructure.siloRisk > 60 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                {Math.floor(orgStructure.siloRisk)}%
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-1000 ${orgStructure.siloRisk > 60 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`} 
                style={{ width: `${orgStructure.siloRisk}%` }} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
              <div className="text-[9px] text-slate-600 font-black uppercase tracking-tighter mb-1">生産性倍率</div>
              <div className="text-base font-black text-emerald-400">x{currentEffects.orgProductivity?.toFixed(2)}</div>
            </div>
            <div className="text-center p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
              <div className="text-[9px] text-slate-600 font-black uppercase tracking-tighter mb-1">革新性倍率</div>
              <div className="text-base font-black text-purple-400">x{currentEffects.orgInnovation?.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
