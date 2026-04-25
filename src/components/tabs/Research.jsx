import React from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { CHASSIS_TECH, COMPONENT_TECH, CORPORATE_FOCUSES, ERAS } from '../../constants/index.js';

// 分割したコンポーネントのインポート
import { ResearchTabs } from './Research/ResearchTabs.jsx';
import { TechEraColumn } from './Research/TechEraColumn.jsx';
import { TechNode } from './Research/TechNode.jsx';

const CATEGORIES = [
  { id: 'home_appliance', name: '白物家電' },
  { id: 'audio',          name: 'オーディオ' },
  { id: 'video',          name: 'ビデオ・映像' },
  { id: 'game_console',   name: 'ゲーム機' },
  { id: 'digital',        name: 'デジタル機器' },
  { id: 'smart_device',   name: 'スマートデバイス' },
];

export default function Research() {
  const {
    researchPoints, setResearchPoints,
    researchTab, setResearchTab,
    unlockedChassis, setUnlockedChassis,
    unlockedModules, setUnlockedModules,
    completedFocuses, divisions, setDivisions, addLog
  } = useGame();

  const unlocked    = researchTab === 'chassis' ? unlockedChassis : unlockedModules;
  const setUnlocked = researchTab === 'chassis' ? setUnlockedChassis : setUnlockedModules;
  const allUnlocked = [...unlockedChassis, ...unlockedModules];

  const findRequirementName = (id) => {
    const tech = [...CHASSIS_TECH, ...COMPONENT_TECH].find(t => t.id === id);
    if (tech) return tech.name;
    const focus = CORPORATE_FOCUSES.find(f => f.id === id);
    return focus ? focus.name : id;
  };

  const handleUnlock = (tech) => {
    setResearchPoints(p => p - tech.cost);
    setUnlocked(u => [...u, tech.id]);
    
    if (researchTab === 'chassis' && tech.category && !divisions[tech.category]?.active) {
      setDivisions(prev => {
        const next = { ...prev };
        if (next[tech.category]) {
          next[tech.category].active = true;
          Object.keys(next).forEach(k => {
            if (next[k].active && k !== tech.category) {
              next[k].budgetShare = next[k].budgetShare * 0.9;
            }
          });
          next[tech.category].budgetShare = 10;
        }
        return next;
      });
      addLog(`新技術により【${divisions[tech.category]?.name || tech.category}】が設立されました！`, 'info', 'text-cyan-300');
    }
  };

  const renderTechNode = (tech) => {
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
  };

  return (
    <div className="space-y-6 flex flex-col h-full max-w-7xl mx-auto">
      <ResearchTabs 
        activeTab={researchTab}
        onTabChange={setResearchTab}
        researchPoints={researchPoints}
      />

      {/* メインエリア */}
      <div className="flex-1 bg-slate-950/50 rounded-3xl border border-slate-800 overflow-x-auto custom-scrollbar shadow-inner">
        {researchTab === 'chassis' ? (
          /* シャーシ：事業部(行) × 時代(列) のマトリクス表示 */
          <div className="min-w-max p-8">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-slate-500 text-xs font-black uppercase tracking-widest text-left sticky left-0 bg-slate-950/50 backdrop-blur-md z-10">Division</th>
                  {ERAS.map(era => (
                    <th key={era} className="p-4 min-w-[240px] text-indigo-400 font-black text-xl border-l border-slate-800/50">
                      {era}s
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map(cat => (
                  <tr key={cat.id} className="border-t border-slate-800/50 group hover:bg-slate-900/40 transition-colors">
                    <td className="p-6 sticky left-0 bg-slate-950/80 backdrop-blur-md z-10 border-r border-slate-800/50">
                      <div className="font-black text-slate-200 text-lg">{cat.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{cat.id.replace('_', ' ')}</div>
                    </td>
                    {ERAS.map(era => {
                      const techs = CHASSIS_TECH.filter(t => t.category === cat.id && t.era === era);
                      return (
                        <td key={era} className="p-6 border-l border-slate-800/20 align-top">
                          <div className="flex flex-wrap gap-4">
                            {techs.map(tech => renderTechNode(tech))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* 部品ユニット：従来通りの時代別カラム表示 */
          <div className="flex gap-24 min-w-max p-12 px-16">
            {ERAS.map(era => (
              <TechEraColumn key={era} era={era}>
                {COMPONENT_TECH.filter(t => t.era === era).map(tech => renderTechNode(tech))}
              </TechEraColumn>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
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
