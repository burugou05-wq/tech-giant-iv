import React from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { CHASSIS_TECH, COMPONENT_TECH, CORPORATE_FOCUSES } from '../../constants/index.js';
import { TechNode } from './Research/TechNode.jsx';

// UI表示用に部品ユニットをカテゴリーに振り分けるマッピング
const COMPONENT_CATEGORY_MAP = {
  mod_wood_box: 'audio',
  mod_heater_wire: 'home_appliance',
  mod_vacuum_tube: 'audio',
  mod_paper_cone: 'audio',
  mod_mag_tape: 'audio',
  mod_transistor: 'audio',
  mod_crt_tube: 'video',
  mod_trinitron: 'video',
  mod_compact_motor: 'audio',
  mod_stereo_hp: 'audio',
  mod_ic_board: 'video',
  mod_optical_pickup: 'audio',
  mod_lsi_chip: 'game_console',
  mod_cd_rom: 'game_console',
  mod_flash_mem: 'digital',
  mod_cpu_chip: 'game_console',
  mod_lithium_batt: 'smart_device',
  mod_mobile_soc: 'smart_device',
  mod_cloud_sync: 'smart_device',
  mod_oled_touch: 'smart_device',
  mod_ai_chip: 'smart_device',
  mod_5g_comm: 'smart_device',
};

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
    unlockedChassis, setUnlockedChassis,
    unlockedModules, setUnlockedModules,
    completedFocuses, divisions, setDivisions, addLog
  } = useGame();

  const allUnlocked = [...unlockedChassis, ...unlockedModules];

  const findRequirementName = (id) => {
    const tech = [...CHASSIS_TECH, ...COMPONENT_TECH].find(t => t.id === id);
    if (tech) return tech.name;
    const focus = CORPORATE_FOCUSES.find(f => f.id === id);
    return focus ? focus.name : id;
  };

  const handleUnlock = (tech, isChassis) => {
    setResearchPoints(p => p - tech.cost);
    if (isChassis) {
      setUnlockedChassis(u => [...u, tech.id]);
      if (tech.category && !divisions[tech.category]?.active) {
        setDivisions(prev => {
          const next = { ...prev };
          if(next[tech.category]) {
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
    } else {
      setUnlockedModules(u => [...u, tech.id]);
    }
  };

  // 技術の描画ヘルパー
  const renderTechs = (techs, isChassis) => {
    return techs.map(tech => {
      const isUnlocked = isChassis ? unlockedChassis.includes(tech.id) : unlockedModules.includes(tech.id);
      const canAfford  = researchPoints >= tech.cost;
      const reqMet     = !tech.req || tech.req.length === 0 || tech.req.every(r => (
        allUnlocked.includes(r) || completedFocuses.includes(r)
      ));
      
      return (
        <div key={tech.id} className="transform scale-90 origin-top-left -mb-4 mr-[-10%]">
          <TechNode 
            tech={tech}
            isUnlocked={isUnlocked}
            canAfford={canAfford}
            reqMet={reqMet}
            requirementNames={tech.req?.map(r => findRequirementName(r)) || []}
            onUnlock={() => handleUnlock(tech, isChassis)}
          />
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full max-w-[1400px] mx-auto space-y-4">
      <div className="flex justify-between items-end mb-2 px-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 uppercase tracking-widest">R&D Matrix</h2>
          <p className="text-slate-400 text-sm">技術・部品の俯瞰ダッシュボード</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Available Points</div>
          <div className="text-3xl font-black text-white">{Math.floor(researchPoints).toLocaleString()} <span className="text-sm text-slate-500">RP</span></div>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/80 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl flex flex-col">
        {/* ヘッダー行 */}
        <div className="flex bg-slate-800 border-b-2 border-slate-700">
          <div className="w-48 p-4 font-black text-slate-300 border-r-2 border-slate-700 flex items-center justify-center tracking-widest">
            事業カテゴリー
          </div>
          <div className="flex-1 grid grid-cols-2">
            <div className="p-4 font-black text-indigo-300 border-r-2 border-slate-700 text-center text-lg tracking-widest bg-indigo-900/20">
              シャーシ (Chassis)
            </div>
            <div className="p-4 font-black text-emerald-300 text-center text-lg tracking-widest bg-emerald-900/20">
              部品ユニット (Component)
            </div>
          </div>
        </div>

        {/* データ行 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {CATEGORIES.map(cat => {
            const chassisForCat = CHASSIS_TECH.filter(t => t.category === cat.id);
            const componentsForCat = COMPONENT_TECH.filter(t => COMPONENT_CATEGORY_MAP[t.id] === cat.id);

            return (
              <div key={cat.id} className="flex border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <div className="w-48 p-4 border-r-2 border-slate-700 flex flex-col items-center justify-center bg-slate-800/20">
                  <span className="font-black text-slate-200 text-lg text-center leading-tight">{cat.name}</span>
                  <span className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">{cat.id.replace('_', ' ')}</span>
                </div>
                <div className="flex-1 grid grid-cols-2">
                  <div className="p-4 border-r-2 border-slate-700/50 flex flex-wrap gap-4 items-start content-start">
                    {renderTechs(chassisForCat, true)}
                    {chassisForCat.length === 0 && <span className="text-slate-600 italic text-sm m-auto">該当技術なし</span>}
                  </div>
                  <div className="p-4 flex flex-wrap gap-4 items-start content-start">
                    {renderTechs(componentsForCat, false)}
                    {componentsForCat.length === 0 && <span className="text-slate-600 italic text-sm m-auto">該当技術なし</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
