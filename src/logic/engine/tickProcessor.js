import { 
  START_DATE, 
  HISTORICAL_EVENTS,
  CORPORATE_FOCUSES
} from '../../constants/index.js';
import { AI_COMPANIES } from '../../constants/companies/index.js';
import { 
  getCurrentEffects, 
  calculateEffectiveAppeal 
} from '../../utils/gameLogic.js';
import { 
  simulateAI, 
  simulateMarketShares,
  processAIBusinessLogic
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
  let instantEffectMoney = 0;

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

  let nextActiveFocus  = s.activeFocus ? { ...s.activeFocus } : null;
  let nextCompletedFocuses = [...s.completedFocuses];
  let nextUnlockedTrees = [...(s.unlockedTrees || ['main'])];

  // 【救済措置】方針が完了しているのに市場が閉じている場合の強制アンロック
  if (nextCompletedFocuses.includes('fc_global_entry')) {
    if (nextMarkets.na) nextMarkets.na.locked = false;
    if (nextMarkets.eu) nextMarkets.eu.locked = false;
  }

  // 1.5 重点方針（Focus）の進行
  if (nextActiveFocus) {
    nextActiveFocus.remainingTicks -= 1;
    // 進捗率の更新
    if (nextActiveFocus.totalTicks > 0) {
      nextActiveFocus.progress = Math.floor(((nextActiveFocus.totalTicks - nextActiveFocus.remainingTicks) / nextActiveFocus.totalTicks) * 100);
    }
    
    if (nextActiveFocus.remainingTicks <= 0) {
      const focusId = nextActiveFocus.id;
      nextCompletedFocuses.push(focusId);
      
      // 方針完了時のエフェクト処理（ツリー解放など）
      const focusDef = CORPORATE_FOCUSES.find(f => f.id === focusId);
      if (focusDef?.effects) {
        // 1. ツリー解放
        if (focusDef.effects.unlockTree) {
          const tree = focusDef.effects.unlockTree;
          if (!nextUnlockedTrees.includes(tree)) {
            nextUnlockedTrees.push(tree);
          }
        }
        // 2. 海外市場の解放
        if (focusDef.effects.openOverseas) {
          if (nextMarkets.na) nextMarkets.na.locked = false;
          if (nextMarkets.eu) nextMarkets.eu.locked = false;
          newLogs.push({ time: dateStr, msg: `【海外展開】北米市場と欧州市場が解放されました！`, type: 'info', color: 'text-indigo-400' });
        }
        // 3. 即時資金変動
        if (focusDef.effects.instantMoney) {
          instantEffectMoney += focusDef.effects.instantMoney;
        }
      }

      newLogs.push({ time: dateStr, msg: `【方針完了】「${nextActiveFocus.name}」が完了しました。`, type: 'success', color: 'text-cyan-400' });
      nextActiveFocus = null;
    }
  }

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

  const sellableProducts = s.blueprints.map(bp => {
    const app = calculateEffectiveAppeal(bp, calcYear, s.contentOwned, loopEffects);
    return {
      bp, 
      app: Number.isFinite(app) ? app : 0,
      stock: (nextInv[bp.id]?.amount || 0),
      isOnLine: nextLines.some(l => l.blueprintId === bp.id && l.factories > 0),
      strategy: nextLines.find(l => l.blueprintId === bp.id)?.strategy
    };
  }).filter(p => p.stock > 0 || p.isOnLine).sort((a, b) => b.app - a.app);

  simulateAI(nextAiProducts, calcYear, dateStr, newLogs, nextMarkets);
  
  // AI 企業の収支・設備の更新用 (セルフヒーリング付き)
  const nextAiFinances = JSON.parse(JSON.stringify(s.aiFinances || {}));
  Object.keys(AI_COMPANIES).forEach(id => {
    if (!nextAiFinances[id]) {
      const ai = AI_COMPANIES[id];
      nextAiFinances[id] = {
        money: ai.initialMoney || 100000,
        isBankrupt: false,
        activeMarkets: Object.keys(ai.regions || { jp: 0 }),
        factories: ai.initialFactories || Math.max(5, Math.floor((ai.initialMoney || 100000) / 15000)),
        operatingRate: 0.8
      };
    }
  });
  
  const totalPlayerDemandShare = simulateMarketShares(nextMarkets, nextAiProducts, sellableProducts[0] || null, calcYear, loopEffects, nextAiFinances);
  
  // AI の経営判断（工場の増設・閉鎖）を実行
  processAIBusinessLogic(nextAiFinances, newTick, dateStr, newLogs);

  const salesResults = executeSales(nextMarkets, sellableProducts, nextInv, loopEffects, nextYenRate, s.euExtraCost ?? 0);

  // --- AI 企業の収支・価格戦略の更新 ---
  Object.entries(salesResults.aiSales).forEach(([id, sales]) => {
    const aiProduct = nextAiProducts[id];
    const aiFin = nextAiFinances[id];
    const aiDef = AI_COMPANIES[id];
    if (aiProduct && aiFin && !aiFin.isBankrupt) {
      const revenue = sales.units * aiProduct.price;
      const cost = sales.units * (aiProduct.baseCost || 70);
      const tickProfit = revenue - cost;
      
      aiFin.money += tickProfit;
      
      // 利益率ベースの動的価格設定
      const currentMargin = tickProfit / (Math.abs(revenue) || 1);
      const targetMargin = aiDef?.minMargin || 0.25;
      
      if (currentMargin < targetMargin) {
        aiProduct.price = Math.round(aiProduct.price * 1.02); // 利益不足なら値上げ
      } else if (currentMargin > targetMargin + 0.2) {
        aiProduct.price = Math.round(aiProduct.price * 0.99); // 余裕があれば値下げしてシェア取り
      }
      
      // 倒産判定（債務超過）
      if (aiFin.money < -100000) {
        aiFin.isBankrupt = true;
        newLogs.push({ time: dateStr, msg: `【倒産】${aiDef.name}が経営破綻し、市場から撤退しました。`, type: 'error', color: 'text-red-500' });
        // 全市場からシェアを抹消
        Object.keys(nextMarkets).forEach(mKey => {
          if (nextMarkets[mKey].shares[id]) nextMarkets[mKey].shares[id] = 0;
        });
      }
    }
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
  let rpGain = (15 + Math.floor((calcYear - 1946) / 3)) * loopEffects.rpMulti * orgResults.orgInnovation;
  if (orgResults.isSiloActive) rpGain *= 0.5;
  if (!Number.isFinite(rpGain)) rpGain = 0;

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
      money: s.money + profit + instantEffectMoney,
      researchPoints: s.researchPoints + rpGain,
      leadershipPower: s.leadershipPower + 1,
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
