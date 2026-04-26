import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { CHASSIS_TECH, COMPONENT_TECH } from '../../constants/index.js';

// 分割したコンポーネントとロジックのインポート
import { DesignStudio } from './Design/DesignStudio.jsx';
import { BlueprintCatalog } from './Design/BlueprintCatalog.jsx';
import { calculateDesignSpecs } from '../../logic/engine/designLogic.js';

export default function Design() {
  const {
    unlockedChassis, unlockedModules,
    designName, setDesignName,
    selectedChassisId, setSelectedChassisId,
    designSlots, setDesignSlots,
    designPrice, setDesignPrice,
    designStrategy, setDesignStrategy,
    blueprints, setBlueprints,
    productionLines, money, currentYear,
    refreshBlueprint, divisions, currentEffects,
    aiProducts
  } = useGame();

  const [designSubTab, setDesignSubTab] = React.useState('studio');

  const chassis = useMemo(() => 
    CHASSIS_TECH.find(c => c.id === selectedChassisId) || CHASSIS_TECH[0],
    [selectedChassisId]
  );

  // スペックのプレビュー計算
  const specs = useMemo(() => calculateDesignSpecs({
    chassis,
    designSlots,
    allTech: COMPONENT_TECH,
    chassisDiv: divisions[chassis.category],
    currentYear,
    currentEffects,
    aiProducts
  }), [chassis, designSlots, divisions, currentYear, currentEffects, aiProducts]);

  const canSave = designName && chassis.slots.every(s => designSlots[s]);

  /**
   * 設計図の保存ハンドラ
   */
  const handleSave = () => {
    const modules = {};
    chassis.slots.forEach(s => { modules[s] = designSlots[s]; });
    
    setBlueprints(prev => [...prev, {
      id: `bp_${Date.now()}`,
      name: designName,
      chassisId: chassis.id,
      baseAppeal: specs.appeal,
      cost: specs.cost,
      price: designPrice,
      strategy: designStrategy,
      modules: modules,
      launchYear: currentYear,
      generation: 1,
      totalSold: 0,
    }]);

    // 入力リセット
    setDesignName('');
    setDesignSlots({});
    setDesignPrice(100);
    setDesignStrategy('mainstream');
    setDesignSubTab('archive'); // 保存したらアーカイブへ移動
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* サブタブセレクター */}
      <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-700/50 w-fit mx-auto shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setDesignSubTab('studio')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
            designSubTab === 'studio' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-105' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="text-lg">🏗️</span>
          新規設計スタジオ
        </button>
        <button
          onClick={() => setDesignSubTab('archive')}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
            designSubTab === 'archive' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-105' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span className="text-lg">📁</span>
          設計図アーカイブ
          {blueprints.length > 0 && (
            <span className="bg-slate-800 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-md ml-1">{blueprints.length}</span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {designSubTab === 'studio' ? (
          <div className="h-full overflow-y-auto custom-scrollbar px-4">
            <DesignStudio 
              designName={designName}
              setDesignName={setDesignName}
              selectedChassisId={selectedChassisId}
              setSelectedChassisId={setSelectedChassisId}
              designSlots={designSlots}
              setDesignSlots={setDesignSlots}
              designPrice={designPrice}
              setDesignPrice={setDesignPrice}
              designStrategy={designStrategy}
              setDesignStrategy={setDesignStrategy}
              unlockedChassis={unlockedChassis}
              unlockedModules={unlockedModules}
              specs={specs}
              canSave={canSave}
              onSave={handleSave}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scrollbar px-4">
            <BlueprintCatalog 
              blueprints={blueprints}
              currentYear={currentYear}
              money={money}
              productionLines={productionLines}
              onRemove={(id) => setBlueprints(prev => prev.filter(b => b.id !== id))}
              onUpdatePrice={(id, newPrice) => {
                setBlueprints(prev => prev.map(bp => bp.id === id ? { ...bp, price: newPrice } : bp));
              }}
              onUpdateStrategy={(id, newStrategy) => {
                setBlueprints(prev => prev.map(bp => bp.id === id ? { ...bp, strategy: newStrategy } : bp));
              }}
              onRefresh={refreshBlueprint}
            />
          </div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
