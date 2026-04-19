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
    blueprints, setBlueprints,
    productionLines, money, currentYear,
    refreshBlueprint, divisions, currentEffects,
    aiProducts
  } = useGame();

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
      modules: modules,
      launchYear: currentYear,
      generation: 1,
    }]);

    // 入力リセット
    setDesignName('');
    setDesignSlots({});
    setDesignPrice(100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
      {/* 左側: 設計スタジオ */}
      <DesignStudio 
        designName={designName}
        setDesignName={setDesignName}
        selectedChassisId={selectedChassisId}
        setSelectedChassisId={setSelectedChassisId}
        designSlots={designSlots}
        setDesignSlots={setDesignSlots}
        designPrice={designPrice}
        setDesignPrice={setDesignPrice}
        unlockedChassis={unlockedChassis}
        unlockedModules={unlockedModules}
        specs={specs}
        canSave={canSave}
        onSave={handleSave}
      />

      {/* 右側: カタログ */}
      <BlueprintCatalog 
        blueprints={blueprints}
        currentYear={currentYear}
        money={money}
        productionLines={productionLines}
        onRemove={(id) => setBlueprints(prev => prev.filter(b => b.id !== id))}
        onUpdatePrice={(id, newPrice) => {
          setBlueprints(prev => prev.map(bp => bp.id === id ? { ...bp, price: newPrice } : bp));
        }}
        onRefresh={refreshBlueprint}
      />
      
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
