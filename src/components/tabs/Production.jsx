import React from 'react';
import { useGame } from '../../context/GameContext.jsx';

// 分割したコンポーネントのインポート
import { FactorySummary } from './Production/FactorySummary.jsx';
import { ProductionLineCard } from './Production/ProductionLineCard.jsx';

export default function Production() {
  const {
    productionLines, setProductionLines,
    totalFactories, setTotalFactories,
    money, setMoney,
    blueprints, markets, inventory,
    setLineStrategy
  } = useGame();

  const totalUsedFactories = productionLines.reduce((s, l) => s + l.factories, 0);

  // 推定需要の合計計算
  const estimatedDemand = Object.values(markets).reduce((sum, m) => {
    if (m.locked) return sum;
    return sum + Math.floor(m.demand * m.shares.player);
  }, 0);

  // 総生産量の合計計算
  const totalProduction = productionLines.reduce((sum, line) => {
    if (line.strategy === 'discount') return sum;
    return sum + Math.floor(line.factories * 40 * (line.efficiency / 100));
  }, 0);

  // 工場増設ハンドラ
  const handleExpandFactories = () => {
    const cost = 20000 + (totalFactories - 10) * 5000;
    if (money < cost) return;
    setMoney(prev => prev - cost);
    setTotalFactories(prev => prev + 1);
  };

  // 新規ライン追加ハンドラ
  const handleAddLine = () => {
    if (blueprints.length === 0) return;
    setProductionLines(prev => [...prev, {
      id: `line_${Date.now()}`,
      blueprintId: blueprints[0].id,
      factories: 0,
      efficiency: 10,
      strategy: 'standard'
    }]);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 全体統計サマリー */}
      <FactorySummary 
        totalUsedFactories={totalUsedFactories}
        totalFactories={totalFactories}
        totalProduction={totalProduction}
        estimatedDemand={estimatedDemand}
        money={money}
        onExpand={handleExpandFactories}
        onAddLine={handleAddLine}
      />

      {/* 生産ラインリスト */}
      <div className="space-y-4">
        {productionLines.map(line => (
          <ProductionLineCard 
            key={line.id}
            line={line}
            blueprints={blueprints}
            inventory={inventory}
            onSetStrategy={setLineStrategy}
            onUpdateLine={(id, updates) => setProductionLines(ls => 
              ls.map(l => l.id === id ? { ...l, ...updates } : l)
            )}
            onRemove={(id) => setProductionLines(ls => ls.filter(l => l.id !== id))}
            canAddFactory={totalUsedFactories < totalFactories}
          />
        ))}
        
        {productionLines.length === 0 && (
          <div className="p-12 text-center bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-3xl">
            <div className="text-slate-500 font-black uppercase tracking-widest text-sm mb-2">生産ラインがありません</div>
            <p className="text-slate-600 text-xs font-bold">「新規ライン追加」から製造を開始してください</p>
          </div>
        )}
      </div>
    </div>
  );
}
