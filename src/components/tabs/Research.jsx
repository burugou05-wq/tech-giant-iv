import React from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { CHASSIS_TECH, COMPONENT_TECH, CORPORATE_FOCUSES, ERAS } from '../../constants/index.js';

// 分割したコンポーネントのインポート
import { ResearchTabs } from './Research/ResearchTabs.jsx';
import { TechEraColumn } from './Research/TechEraColumn.jsx';
import { TechNode } from './Research/TechNode.jsx';

export default function Research() {
  const {
    researchPoints, setResearchPoints,
    researchTab, setResearchTab,
    unlockedChassis, setUnlockedChassis,
    unlockedModules, setUnlockedModules,
    completedFocuses, divisions, setDivisions, addLog
  } = useGame();

  const techList    = researchTab === 'chassis' ? CHASSIS_TECH : COMPONENT_TECH;
  const unlocked    = researchTab === 'chassis' ? unlockedChassis : unlockedModules;
  const setUnlocked = researchTab === 'chassis' ? setUnlockedChassis : setUnlockedModules;
  
  const allTech     = [...CHASSIS_TECH, ...COMPONENT_TECH];
  const allUnlocked = [...unlockedChassis, ...unlockedModules];

  /**
   * 必要条件の名前を検索
   */
  const findRequirementName = (id) => {
    const tech = allTech.find(t => t.id === id);
    if (tech) return tech.name;
    const focus = CORPORATE_FOCUSES.find(f => f.id === id);
    return focus ? focus.name : id;
  };

  /**
   * 技術開発ハンドラ
   */
  const handleUnlock = (tech) => {
    setResearchPoints(p => p - tech.cost);
    setUnlocked(u => [...u, tech.id]);
    
    // 特定の技術開発による事業部設立ロジック
    if (researchTab === 'chassis' && tech.category && !divisions[tech.category].active) {
      setDivisions(prev => {
        const next = { ...prev };
        next[tech.category].active = true;
        // 予算配分の自動調整（新事業部に10%割り当て）
        Object.keys(next).forEach(k => {
          if (next[k].active && k !== tech.category) {
            next[k].budgetShare = next[k].budgetShare * 0.9;
          }
        });
        next[tech.category].budgetShare = 10;
        return next;
      });
      addLog(`新技術により【${divisions[tech.category].name}】が設立されました！`, 'info', 'text-cyan-300');
    }
  };

  return (
    <div className="space-y-8 flex flex-col h-full max-w-7xl mx-auto">
      {/* ヘッダー・タブセクション */}
      <ResearchTabs 
        activeTab={researchTab}
        onTabChange={setResearchTab}
        researchPoints={researchPoints}
      />

      {/* 技術ツリーセクション（横スクロール） */}
      <div className="flex-1 bg-slate-950/50 rounded-3xl border border-slate-800 overflow-x-auto p-12 custom-scrollbar shadow-inner">
        <div className="flex gap-24 min-w-max px-4">
          {ERAS.map(era => (
            <TechEraColumn key={era} era={era}>
              {techList.filter(t => t.era === era).map(tech => {
                const isUnlocked = unlocked.includes(tech.id);
                const canAfford  = researchPoints >= tech.cost;
                const reqMet     = !tech.req || tech.req.length === 0 || tech.req.every(r => (
                  allUnlocked.includes(r) || completedFocuses.includes(r)
                ));
                
                return (
                  <TechNode 
                    key={tech.id}
                    tech={tech}
                    isUnlocked={isUnlocked}
                    canAfford={canAfford}
                    reqMet={reqMet}
                    requirementNames={tech.req?.map(r => findRequirementName(r)) || []}
                    onUnlock={() => handleUnlock(tech)}
                  />
                );
              })}
            </TechEraColumn>
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
          border: 1px solid #334155;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
