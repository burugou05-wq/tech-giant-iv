import { 
  START_DATE, 
  HISTORICAL_EVENTS 
} from '../../constants/index.js';
import { 
  getCurrentEffects, 
  calculateEffectiveAppeal 
} from '../../utils/gameLogic.js';
import { 
  simulateAI, 
  simulateMarketShares 
} from '../../utils/aiSimulation.js';

import { updateOrgSystem } from '../../systems/orgSystem.js';
import { updateMarketSystem, executeSales } from '../../systems/marketSystem.js';
import { updateProductionSystem } from '../../systems/productionSystem.js';
import { updateFinanceSystem } from '../../systems/financeSystem.js';

/**
 * 1ターンのゲーム経過を計算するコアロジック
 * @param {Object} s - 現在のゲーム状態（スナップショット）
 * @returns {Object} 計算後の新しい状態、および発生したログやイベント
 */
export function processGameTick(s) {
  const newTick      = s.ticks + 1;
  const preciseYear  = 1946 + newTick * 14 / 365.25;
  const calcYear     = Math.floor(preciseYear);
  const dateStr      = new Date(START_DATE.getTime() + newTick * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let nextLines        = s.productionLines.map(l => ({ ...l }));
  let nextInv          = structuredClone(s.inventory);
  let nextMarkets      = structuredClone(s.markets);
  let nextAiProducts   = structuredClone(s.aiProducts);
  let nextOrgStructure = structuredClone(s.orgStructure);
  let nextDivisions    = structuredClone(s.divisions);
  let nextFlags        = { ...s.flags };
  let newLogs          = [];
  let nextActiveEvent  = null;
  let nextIsPaused     = false;

  const baseEffects = getCurrentEffects(s.completedFocuses);
  const budget = nextOrgStructure.budgetAllocation || { rnd: 50, production: 50, marketing: 50, hr: 50 };

  // 1. 歴史イベントのチェック
  const pendingEvent = HISTORICAL_EVENTS.find(e => calcYear >= e.year && !nextFlags[e.flagKey]);
  if (pendingEvent) {
    nextFlags[pendingEvent.flagKey] = true;
    return {
      type: 'EVENT',
      event: pendingEvent,
      flags: nextFlags
    };
  }

  // 2. 各システムによる計算
  const hasFlagship = nextLines.some(l => l.strategy === 'flagship');
  const orgResults = updateOrgSystem(nextOrgStructure, budget, baseEffects, calcYear, baseEffects, nextFlags, dateStr, newLogs, nextDivisions);
  const loopEffects = { ...baseEffects, ...orgResults, hasFlagship };

  const nextYenRate = Math.max(0.6, Math.min(1.5, s.yenRate + (Math.random() - 0.5) * 0.01));
  updateMarketSystem(nextMarkets, preciseYear, calcYear, nextFlags, dateStr, newLogs, nextYenRate);

  const prodResults = updateProductionSystem(
    nextLines, nextInv, s.blueprints, s.qualityLevel, loopEffects, 
    s.activeFocus, orgResults.isSiloActive, nextFlags.isStrike
  );

  const sellableProducts = s.blueprints.map(bp => ({
    bp, app: calculateEffectiveAppeal(bp, calcYear, s.contentOwned, loopEffects),
    stock: nextInv[bp.id]?.amount || 0,
    isOnLine: nextLines.some(l => l.blueprintId === bp.id && l.factories > 0),
    strategy: nextLines.find(l => l.blueprintId === bp.id)?.strategy
  })).filter(p => p.stock > 0 || p.isOnLine).sort((a, b) => b.app - a.app);

  simulateAI(nextAiProducts, calcYear, dateStr, newLogs);
  const totalPlayerDemandShare = simulateMarketShares(nextMarkets, nextAiProducts, sellableProducts[0] || null, calcYear, loopEffects);
  const salesResults = executeSales(nextMarkets, sellableProducts, nextInv, loopEffects, nextYenRate, s.euExtraCost ?? 0);

  const financeResults = updateFinanceSystem(
    s.money, salesResults.currentRevenue - (prodResults.currentVarCost + prodResults.repairCostThisTick),
    totalPlayerDemandShare, calcYear, s.totalFactories, nextMarkets, budget, loopEffects, 0, 0
  );

  const totalTickCost = prodResults.currentVarCost + salesResults.currentVarCostAdd + financeResults.currentFixedCost + financeResults.currentMarketingCost + financeResults.currentStoreCost;
  const profit = salesResults.currentRevenue - totalTickCost;

  // 3. リソースと事業部経験値の更新
  let rpGain = (15 + Math.floor((calcYear - 1946) / 3)) * loopEffects.rpMulti * orgResults.orgInnovation;
  if (orgResults.isSiloActive) rpGain *= 0.5;

  Object.values(nextDivisions).forEach(div => {
    if (!div.active) return;
    const divLines = nextLines.filter(l => l.factories > 0 && s.blueprints.find(b => b.id === l.blueprintId && b.category === div.id));
    div.xp += divLines.reduce((sum, l) => sum + l.factories, 0);
    if (div.xp > div.level * 500) { 
      div.xp -= div.level * 500; 
      div.level = Math.min(10, div.level + 1); 
    }
  });

  // 4. 計算結果をまとめる
  return {
    type: 'TICK',
    nextState: {
      money: s.money + profit,
      researchPoints: s.researchPoints + rpGain,
      leadershipPower: s.leadershipPower + 1,
      stockPrice: financeResults.newStockPrice(s.stockPrice),
      yenRate: nextYenRate,
      ticks: newTick,
      productionLines: nextLines,
      inventory: nextInv,
      markets: nextMarkets,
      aiProducts: nextAiProducts,
      flags: nextFlags,
      orgStructure: nextOrgStructure,
      divisions: nextDivisions
    },
    lastTickProfit: {
      revenue: salesResults.currentRevenue, 
      varCost: prodResults.currentVarCost, 
      fixedCost: financeResults.currentFixedCost,
      marketingCost: financeResults.currentMarketingCost, 
      storeCost: financeResults.currentStoreCost,
      repairCost: prodResults.repairCostThisTick, 
      b2b: 0
    },
    profit,
    totalTickCost,
    salesResults,
    calcYear,
    newLogs: newLogs.reverse()
  };
}
