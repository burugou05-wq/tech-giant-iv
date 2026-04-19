import React from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { CONTENT_INVESTMENTS, DECISIONS } from '../../constants/index.js';

// 分割したコンポーネントのインポート
import { FinancialSummary } from './Dashboard/FinancialSummary.jsx';
import { OperationalQuality } from './Dashboard/OperationalQuality.jsx';
import { ContentInvestment } from './Dashboard/ContentInvestment.jsx';
import { ProductLifecycle } from './Dashboard/ProductLifecycle.jsx';
import { UrgentDecisions } from './Dashboard/UrgentDecisions.jsx';

export default function Dashboard() {
  const game = useGame();
  const {
    stockPrice, playerEquity, money, setMoney, setPlayerEquity, setStockPrice,
    lastTickProfit, currentEffects, yenRate, qualityLevel, setQualityLevel,
    contentOwned, setContentOwned, leadershipPower, executeDecision,
    blueprints, currentYear,
  } = game;

  // 利益計算
  const totalCost = lastTickProfit.varCost + lastTickProfit.fixedCost
    + lastTickProfit.marketingCost + lastTickProfit.storeCost;
  const profit = lastTickProfit.revenue - totalCost;

  // イベントハンドラ
  const handleBuyBack = () => {
    if (playerEquity >= 100) return;
    const cost = Math.floor(5000 * (stockPrice / 100));
    if (money < cost) return;
    setMoney(prev => prev - cost);
    setPlayerEquity(p => Math.min(100, p + 10));
  };

  const handleSellEquity = () => {
    if (playerEquity <= 10) return;
    const gain = Math.floor(5000 * (stockPrice / 100));
    setMoney(prev => prev + gain);
    setPlayerEquity(p => Math.max(0, p - 10));
  };

  const handleInvest = (inv) => {
    if (money < inv.cost) return;
    setMoney(prev => prev - inv.cost);
    setContentOwned(p => [...p, inv.id]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左2列: メイン統計と管理パネル */}
      <div className="lg:col-span-2 space-y-6">
        <FinancialSummary 
          stockPrice={stockPrice}
          money={money}
          profit={profit}
          yenRate={yenRate}
          playerEquity={playerEquity}
          onBuyBack={handleBuyBack}
          onSellEquity={handleSellEquity}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <OperationalQuality 
            qualityLevel={qualityLevel}
            qualityCap={currentEffects.qualityCap}
            onQualityChange={setQualityLevel}
          />

          <ContentInvestment 
            investments={CONTENT_INVESTMENTS}
            ownedIds={contentOwned}
            money={money}
            onInvest={handleInvest}
          />
        </div>

        <ProductLifecycle 
          blueprints={blueprints}
          currentYear={currentYear}
        />
      </div>

      {/* 右1列: 緊急決議 */}
      <div className="lg:col-span-1">
        <UrgentDecisions 
          decisions={DECISIONS}
          game={game}
          leadershipPower={leadershipPower}
          money={money}
          onExecute={executeDecision}
        />
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
