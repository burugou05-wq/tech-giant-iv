import { START_DATE } from '../../constants/index.js';
import { getCurrentEffects } from '../../utils/gameLogic.js';
import { 
  simulateAI, 
  simulateMarketShares,
  processAIBusinessLogic
} from '../../utils/aiSimulation.js';

import { updateOrgSystem } from '../../systems/orgSystem.js';
import { updateMarketSystem, executeSales } from '../../systems/marketSystem.js';
import { updateProductionSystem } from '../../systems/productionSystem.js';
import { updateFinanceSystem } from '../../systems/financeSystem.js';

import { handleHistoricalEvents } from '../../systems/eventSystem.js';
import { progressCorporateFocus } from '../../systems/playerFocusSystem.js';
import { 
  ensureAiFinances, 
  processCompanyRelations, 
  updateAiFinancials 
} from '../../systems/aiSystem.js';
import { processMADeals } from '../../systems/maSystem.js';
import { 
  preparePlayerProductList, 
  updateDivisionExperience 
} from '../../systems/playerBusinessSystem.js';

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

  let nextMoney        = s.money;
  let nextFactories    = s.totalFactories;
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
  let instantEffectMoney = 0;

  const baseEffects = getCurrentEffects(s.completedFocuses);
  const budget = nextOrgStructure.budgetAllocation || { rnd: 50, production: 50, marketing: 50, hr: 50 };

  // 1. 歴史イベントのチェック
  const eventResult = handleHistoricalEvents(calcYear, nextFlags);
  if (eventResult) return eventResult;

  let nextActiveFocus  = s.activeFocus ? { ...s.activeFocus } : null;
  let nextCompletedFocuses = [...s.completedFocuses];
  let nextUnlockedTrees = [...(s.unlockedTrees || ['main'])];

  // 1.5 重点方針（Focus）の進行
  const focusContext = { 
    nextActiveFocus, nextCompletedFocuses, nextUnlockedTrees, nextMarkets 
  };
  instantEffectMoney = progressCorporateFocus(focusContext, dateStr, newLogs);
  nextActiveFocus = focusContext.nextActiveFocus;

  // 2. 各システムによる計算
  const hasFlagship = nextLines.some(l => l.strategy === 'flagship');
  const orgResults = updateOrgSystem(nextOrgStructure, budget, baseEffects, calcYear, baseEffects, nextFlags, dateStr, newLogs, nextDivisions);
  const loopEffects = { ...baseEffects, ...orgResults, hasFlagship };

  const nextYenRate = Number.isFinite(s.yenRate) ? Math.max(0.6, Math.min(1.5, s.yenRate + (Math.random() - 0.5) * 0.01)) : 1.0;
  updateMarketSystem(nextMarkets, preciseYear, calcYear, nextFlags, dateStr, newLogs, nextYenRate);

  const prodResults = updateProductionSystem(
    nextLines, nextInv, s.blueprints, s.qualityLevel, loopEffects, 
    s.activeFocus, orgResults.isSiloActive, nextFlags.isStrike
  );

  const sellableProducts = preparePlayerProductList(s.blueprints, nextInv, nextLines, calcYear, loopEffects, s.contentOwned);

  // AI 企業の収支・設備の更新用 (セルフヒーリング付き)
  const nextAiFinances = JSON.parse(JSON.stringify(s.aiFinances || {}));
  ensureAiFinances(nextAiFinances);

  // AI の経営判断（工場の増設・閉鎖）を実行
  processAIBusinessLogic(nextAiFinances, newTick, dateStr, newLogs);

  // M&A 交渉の実行 (半年に一度)
  if (newTick % 13 === 0) {
    const maContext = { 
      nextAiFinances, nextAiProducts, calcYear, nextMarkets, dateStr, newLogs,
      playerStats: { money: nextMoney, factories: nextFactories }
    };
    processMADeals(maContext);
    nextMoney = maContext.playerStats.money;
    nextFactories = maContext.playerStats.factories;
  }

  // --- JVの維持・解消チェック ---
  processCompanyRelations(nextAiFinances, nextMarkets, dateStr, newLogs);

  // --- AI の意思決定と市場シェアのシミュレーション ---
  simulateAI(nextAiProducts, calcYear, dateStr, newLogs, nextMarkets, nextAiFinances);
  
  // プレイヤーの代表製品（最も魅力が高いもの）を取得
  const bestPlayerProduct = sellableProducts.length > 0 ? sellableProducts[0] : null;
  const totalPlayerDemandShare = simulateMarketShares(nextMarkets, nextAiProducts, bestPlayerProduct, calcYear, loopEffects, nextAiFinances);

  const salesResults = executeSales(nextMarkets, sellableProducts, nextInv, loopEffects, nextYenRate, s.euExtraCost ?? 0);

  // --- AI 企業の収支・価格戦略の更新 ---
  updateAiFinancials({
    nextAiFinances, nextAiProducts, nextMarkets, salesResults,
    newTick, dateStr, newLogs
  });

  const financeResults = updateFinanceSystem(
    s.money, salesResults.currentRevenue - (prodResults.currentVarCost + prodResults.repairCostThisTick),
    totalPlayerDemandShare, calcYear, s.totalFactories, nextMarkets, budget, loopEffects, 0, 0
  );

  const safeRevenue = Number.isFinite(salesResults.currentRevenue) ? salesResults.currentRevenue : 0;
  const totalTickCost = (Number.isFinite(prodResults.currentVarCost) ? prodResults.currentVarCost : 0) + 
                        (Number.isFinite(salesResults.currentVarCostAdd) ? salesResults.currentVarCostAdd : 0) + 
                        (Number.isFinite(financeResults.currentFixedCost) ? financeResults.currentFixedCost : 0) + 
                        (Number.isFinite(financeResults.currentMarketingCost) ? financeResults.currentMarketingCost : 0) + 
                        (Number.isFinite(financeResults.currentStoreCost) ? financeResults.currentStoreCost : 0);
  const profit = safeRevenue - totalTickCost;

  // 3. リソースと事業部経験値の更新
  const rpGain = updateDivisionExperience(nextDivisions, nextLines, s.blueprints, calcYear, loopEffects, orgResults);
  
  // 4. 市場需要とイベントフラグの更新
  updateMarketSystem(nextMarkets, preciseYear, calcYear, nextFlags, dateStr, newLogs, nextYenRate);

  // 4. 計算結果をまとめる
  return {
    type: 'TICK',
    nextState: {
      money: nextMoney + profit + instantEffectMoney,
      researchPoints: s.researchPoints + rpGain,
      leadershipPower: s.leadershipPower + 1,
      totalFactories: nextFactories,
      stockPrice: financeResults.newStockPrice(s.stockPrice),
      yenRate: nextYenRate,
      ticks: newTick,
      productionLines: nextLines,
      inventory: nextInv,
      markets: nextMarkets,
      aiProducts: nextAiProducts,
      aiFinances: nextAiFinances,
      flags: nextFlags,
      orgStructure: nextOrgStructure,
      divisions: nextDivisions,
      activeFocus: nextActiveFocus,
      completedFocuses: nextCompletedFocuses,
      unlockedTrees: nextUnlockedTrees
    },
    lastTickProfit: {
      revenue: Number.isFinite(salesResults.currentRevenue) ? salesResults.currentRevenue : 0, 
      varCost: Number.isFinite(prodResults.currentVarCost) ? prodResults.currentVarCost : 0, 
      fixedCost: Number.isFinite(financeResults.currentFixedCost) ? financeResults.currentFixedCost : 0,
      marketingCost: Number.isFinite(financeResults.currentMarketingCost) ? financeResults.currentMarketingCost : 0, 
      storeCost: Number.isFinite(financeResults.currentStoreCost) ? financeResults.currentStoreCost : 0,
      repairCost: Number.isFinite(prodResults.repairCostThisTick) ? prodResults.repairCostThisTick : 0, 
      b2b: 0
    },
    profit,
    totalTickCost,
    salesResults,
    calcYear,
    newLogs: newLogs.reverse()
  };
}
