import { FlaskConical } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';
import { CHASSIS_TECH, COMPONENT_TECH, CORPORATE_FOCUSES, ERAS } from '../../constants/index.js';

export default function Research() {
  const {
    researchPoints, setResearchPoints,
    researchTab, setResearchTab,
    unlockedChassis, setUnlockedChassis,
    unlockedModules, setUnlockedModules,
    completedFocuses, divisions, setDivisions, addLog
  } = useGame();

  const techList   = researchTab === 'chassis' ? CHASSIS_TECH : COMPONENT_TECH;
  const unlocked   = researchTab === 'chassis' ? unlockedChassis : unlockedModules;
  const setUnlocked = researchTab === 'chassis' ? setUnlockedChassis : setUnlockedModules;
  const allTech = [...CHASSIS_TECH, ...COMPONENT_TECH];
  const allUnlocked = [...unlockedChassis, ...unlockedModules];
  const focusIds = CORPORATE_FOCUSES.map(f => f.id);
  const findRequirementName = (id) => {
    const tech = allTech.find(t => t.id === id);
    if (tech) return tech.name;
    const focus = CORPORATE_FOCUSES.find(f => f.id === id);
    return focus ? focus.name : id;
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setResearchTab('chassis')}
            className={`px-6 py-2 rounded-lg font-black text-sm ${researchTab === 'chassis' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            シャーシ
          </button>
          <button
            onClick={() => setResearchTab('components')}
            className={`px-6 py-2 rounded-lg font-black text-sm ${researchTab === 'components' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}
          >
            部品
          </button>
        </div>
        <div className="text-blue-400 font-black text-2xl">{Math.floor(researchPoints)} RP</div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-x-auto p-8">
        <div className="flex gap-16 min-w-max">
          {ERAS.map(era => (
            <div key={era} className="w-64 shrink-0 flex flex-col gap-6">
              <div className="text-center font-black text-slate-600 border-b-2 border-slate-800 pb-3 tracking-widest text-xl">
                {era}年代
              </div>
              {techList.filter(t => t.era === era).map(tech => {
                const isUnlocked = unlocked.includes(tech.id);
                const canAfford  = researchPoints >= tech.cost;
                const reqMet     = !tech.req || tech.req.length === 0 || tech.req.every(r => (
                  allUnlocked.includes(r) || completedFocuses.includes(r)
                ));
                return (
                  <div
                    key={tech.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isUnlocked   ? 'border-green-500 bg-slate-800/50'
                      : !reqMet    ? 'border-slate-800 opacity-30'
                      : canAfford  ? 'border-blue-500 bg-slate-800 hover:border-blue-400'
                      : 'border-slate-700 bg-slate-800/80'
                    }`}
                  >
                    <div className="font-black text-sm text-white flex items-center justify-between">
                      {tech.name}
                      {isUnlocked && <CheckCircle size={14} className="text-green-400" />}
                    </div>
                    {tech.req && tech.req.length > 0 && (
                      <div className="text-[9px] text-slate-600 mt-1">
                        要: {tech.req.map(r => findRequirementName(r)).join(', ')}
                      </div>
                    )}
                    {!isUnlocked && (
                      <button
                        onClick={() => {
                          if (!canAfford || !reqMet) return;
                          setResearchPoints(p => p - tech.cost);
                          setUnlocked(u => [...u, tech.id]);
                          if (researchTab === 'chassis' && tech.category && !divisions[tech.category].active) {
                            setDivisions(prev => {
                              const next = { ...prev };
                              next[tech.category].active = true;
                              // rebalance budget to give new division some budget (e.g. 10%)
                              const activeCount = Object.values(next).filter(d => d.active).length;
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
                        }}
                        disabled={!canAfford || !reqMet}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg mt-3 font-black text-[10px] text-white"
                      >
                        {tech.cost === 0 ? '利用可能' : `${tech.cost} RP`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
