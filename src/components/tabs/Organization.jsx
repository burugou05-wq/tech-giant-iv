import React from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { Network, TrendingUp, AlertCircle, Wrench } from 'lucide-react';

export default function Organization() {
  const { divisions, updateDivisionBudgetShare, orgStructure, updateBudgetAllocation, currentEffects } = useGame();
  
  const activeDivisions = Object.entries(divisions).filter(([_, div]) => div.active);
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-black mb-2 flex items-center gap-2">
          <Network className="text-blue-400" />
          組織投資水準
        </h2>
        <div className="text-[10px] text-slate-400 mb-6">
          各部門を独立に調整。<span className="text-yellow-400 font-bold">50%でニュートラル</span>、それ以上は効果が上がる代わり追加コストが発生します。
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {Object.entries(orgStructure.departments).map(([key, dept]) => {
              const budget = orgStructure.budgetAllocation || { rnd: 50, production: 50, marketing: 50, hr: 50 };
              const val = budget[key];
              const delta = (val - 50) * 20; // positive = extra cost, negative = savings
              return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span className="font-bold">{dept.name}</span>
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
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>0%（ペナルティ）</span>
                  <span>
                    {key === 'rnd' && '研究速度 ↑'}
                    {key === 'production' && '生産効率 ↑'}
                    {key === 'marketing' && '広告連携 ↑'}
                    {key === 'hr' && 'サイロ化抑止 ↑'}
                  </span>
                  <span>100%（最大コスト）</span>
                </div>
              </div>
            )})}
          </div>
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex flex-col justify-center space-y-4">
            <h4 className="text-sm font-black text-cyan-300 mb-2">現在の組織効果</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">生産効率</span>
                <span className={`font-black ${currentEffects.orgProductivity >= 1.0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {currentEffects.orgProductivity >= 1.0 ? '+' : ''}{((currentEffects.orgProductivity - 1.0) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">研究速度</span>
                <span className={`font-black ${currentEffects.orgInnovation >= 1.0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {currentEffects.orgInnovation >= 1.0 ? '+' : ''}{((currentEffects.orgInnovation - 1.0) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">マーケティング連携</span>
                <span className={`font-black ${currentEffects.orgCoordination >= 1.0 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {currentEffects.orgCoordination >= 1.0 ? '+' : ''}{((currentEffects.orgCoordination - 1.0) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-sm mt-4 pt-4 border-t border-slate-700">
                <span className={orgStructure.siloRisk > 50 ? "text-red-400 font-bold" : "text-slate-400 font-bold"}>サイロ化リスク</span>
                <span className={`font-black ${orgStructure.siloRisk > 70 ? 'text-red-500 animate-pulse' : orgStructure.siloRisk > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {Math.floor(orgStructure.siloRisk)} / 100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-6 overflow-y-auto">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <Wrench className="text-indigo-400" />
          製品事業部（プロダクト部門）
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          各事業部の予算配分（合計100%）を決定します。予算配分が公平でない場合や、売上と予算が見合わない場合、士気（Morale）に影響します。
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeDivisions.map(([key, div]) => (
            <div key={key} className="bg-slate-800 border border-slate-700 rounded-xl p-5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-100">{div.name}</h3>
                  <div className="text-xs text-slate-400 mt-1">Lv.{div.level} (XP: {div.xp}/500)</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${div.morale >= 80 ? 'bg-green-500/20 text-green-400' : div.morale <= 40 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                  士気: {Math.floor(div.morale)}%
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">予算配分 (社内シェア)</span>
                    <span className="font-bold text-blue-400">{Math.round(div.budgetShare)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={div.budgetShare}
                    onChange={(e) => updateDivisionBudgetShare(key, parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                
                <div className="bg-slate-900 p-3 rounded-lg flex items-center justify-between">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <TrendingUp size={14} />
                    事業部レベルボーナス
                  </div>
                  <div className="text-sm font-bold text-emerald-400">
                    品質上限 +{div.level * 2}% / 製造費 -{div.level}%
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {activeDivisions.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 font-bold">
              有効な製品事業部がありません。研究タブで新しいシャーシを開発して設立してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
