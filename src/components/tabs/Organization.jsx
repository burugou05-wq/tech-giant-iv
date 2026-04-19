import React from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { Briefcase } from 'lucide-react';

// 分割したコンポーネントのインポート
import { GovernancePanel } from './Organization/GovernancePanel.jsx';
import { DivisionCard } from './Organization/DivisionCard.jsx';

export default function Organization() {
  const { 
    divisions, updateDivisionBudgetShare, 
    orgStructure, updateBudgetAllocation, 
    currentEffects, spinOffDivision, sellSubsidiary,
    money, leadershipPower, markets
  } = useGame();
  
  const activeDivisions = Object.entries(divisions).filter(([_, div]) => div.active);

  /**
   * 事業の売却価格を計算
   */
  const getSalePrice = (div) => {
    if (!div) return 0;
    const orgValue = div.level * 50000;
    const totalShare = Object.values(markets).reduce((sum, m) => sum + (m.shares.player || 0), 0);
    const shareValue = (totalShare / 3) * 1000000;
    return Math.floor((orgValue + shareValue) * 1.5);
  };
  
  return (
    <div className="space-y-8 h-full flex flex-col max-w-6xl mx-auto">
      {/* 組織ステータス & 予算配分セクション */}
      <GovernancePanel 
        orgStructure={orgStructure}
        currentEffects={currentEffects}
        updateBudgetAllocation={updateBudgetAllocation}
      />

      {/* 事業ポートフォリオセクション */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-xl font-black mb-6 flex items-center gap-3">
          <Briefcase className="text-indigo-400" size={24} />
          事業ポートフォリオ
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          {activeDivisions.map(([key, div]) => (
            <DivisionCard 
              key={key}
              divisionKey={key}
              division={div}
              money={money}
              leadershipPower={leadershipPower}
              onUpdateBudget={updateDivisionBudgetShare}
              onSpinOff={spinOffDivision}
              onSell={sellSubsidiary}
              salePrice={getSalePrice(div)}
            />
          ))}
        </div>
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
