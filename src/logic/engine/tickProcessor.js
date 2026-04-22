import { 
  START_DATE, 
  HISTORICAL_EVENTS,
  CORPORATE_FOCUSES
} from '../../constants/index.js';
import { AI_COMPANIES } from '../../constants/companies/index.js';
import { negotiateMA } from './maLogic.js';
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

  simulateAI(nextAiProducts, calcYear, dateStr, newLogs, nextMarkets, nextAiFinances);
  
  const totalPlayerDemandShare = simulateMarketShares(nextMarkets, nextAiProducts, sellableProducts[0] || null, calcYear, loopEffects, nextAiFinances);
  
  // AI の経営判断（工場の増設・閉鎖）を実行
  processAIBusinessLogic(nextAiFinances, newTick, dateStr, newLogs);

  // M&A 交渉の実行 (半年に一度)
  if (newTick % 13 === 0) {
    const deals = negotiateMA(nextAiFinances, nextAiProducts, calcYear);
    deals.forEach(deal => {
      const targetFin = nextAiFinances[deal.targetId];
      const buyerFin = deal.buyerId === 'player' ? null : nextAiFinances[deal.buyerId];
      const targetDef = AI_COMPANIES[deal.targetId];
      const buyerDef = deal.buyerId === 'player' ? { name: '自社' } : AI_COMPANIES[deal.buyerId];

      if (deal.type === 'SUBSIDIARY' && deal.buyerId === 'player') {
         // プレイヤーが子会社化（簡易化のため、工場と資金を吸収して破綻処理）
         nextFactories += targetFin.factories;
         nextMoney -= 20000; // 買収費用
         targetFin.isBankrupt = true;
         newLogs.push({ time: dateStr, msg: `【買収完了】${targetDef.name}の全事業を買収し、技術と設備を統合しました。`, type: 'warning' });
      }
      else if (deal.type === 'SUBSIDIARY') {
        // 買収側の「真のボス（最上位親）」を探す
        let ultimateParentId = deal.buyerId;
        while (nextAiFinances[ultimateParentId]?.parentId) {
          ultimateParentId = nextAiFinances[ultimateParentId].parentId;
        }

        const oldTargetId = deal.targetId;
        targetFin.parentId = ultimateParentId;
        targetFin.money = 5000;
        nextAiFinances[ultimateParentId].money -= 10000; // ボスが代金を支払う

        // 被買収側が連れていた子会社も、すべて新しいボスに紐付け直す
        Object.values(nextAiFinances).forEach(f => {
          if (f.parentId === oldTargetId) {
            f.parentId = ultimateParentId;
          }
        });

        newLogs.push({ 
          time: dateStr, 
          msg: `【グループ入り】${AI_COMPANIES[ultimateParentId].name}が${targetDef.name}を傘下に収めました。`, 
          type: 'warning' 
        });
      } 
      else if (deal.type === 'ABSORPTION') {
        const ultimateParentId = deal.buyerId; // 吸収側をそのまま親とする
        
        // 工場とシェアを吸収
        const factoriesToTransfer = Math.max(1, Math.floor(targetFin.factories * 0.7));
        buyerFin.factories += factoriesToTransfer;
        if (targetFin.money > 0) buyerFin.money += targetFin.money;
        
        // 被買収側の子会社を救済（買収側に紐付け直す）
        Object.values(nextAiFinances).forEach(f => {
          if (f.parentId === deal.targetId) {
            f.parentId = ultimateParentId;
          }
        });

        targetFin.isBankrupt = true;
        newLogs.push({ 
          time: dateStr, 
          msg: `【吸収合併】${buyerDef.name}が${targetDef.name}を完全に統合しました。`, 
          type: 'error' 
        });
      }
      else if (deal.type === 'ABSORPTION' && deal.buyerId === 'player') {
        nextFactories += targetFin.factories;
        nextMoney -= 15000;
        targetFin.isBankrupt = true;
        newLogs.push({ time: dateStr, msg: `【企業買収】経営難の${targetDef.name}を救済買収し、工場を統合しました。`, type: 'error' });
      }
      else if (deal.type === 'MERGER') {
        // 対等合併: IDが若い方を存続会社とする
        const isTargetSurvivor = deal.targetId < deal.buyerId;
        const survivor = isTargetSurvivor ? targetFin : buyerFin;
        const absorbed = isTargetSurvivor ? buyerFin : targetFin;
        const sDef = isTargetSurvivor ? targetDef : buyerDef;
        const aDef = isTargetSurvivor ? buyerDef : targetDef;

        survivor.factories += absorbed.factories;
        survivor.money += absorbed.money;
        
        // 被合併側の子会社を、存続側に紐付け直す
        const absorbedId = isTargetSurvivor ? deal.buyerId : deal.targetId;
        const survivorId = isTargetSurvivor ? deal.targetId : deal.buyerId;
        Object.values(nextAiFinances).forEach(f => {
          if (f.parentId === absorbedId) {
            f.parentId = survivorId;
          }
        });

        absorbed.isBankrupt = true;
        
        newLogs.push({ 
          time: dateStr, 
          msg: `【対等合併】${sDef.name}と${aDef.name}が合併し、経営基盤を強化しました。`, 
          type: 'warning' 
        });
      }
    });
  }

  // --- AI の意思決定と市場シェアのシミュレーション ---
  simulateAI(nextAiProducts, nextMarkets, calcYear, nextAiFinances, dateStr, newLogs);
  
  // プレイヤーの代表製品（最も魅力が高いもの）を取得
  const bestPlayerProduct = sellableProducts.length > 0 ? sellableProducts[0] : null;
  simulateMarketShares(nextMarkets, nextAiProducts, bestPlayerProduct, calcYear, loopEffects, nextAiFinances);

  const salesResults = executeSales(nextMarkets, sellableProducts, nextInv, loopEffects, nextYenRate, s.euExtraCost ?? 0);

  // --- AI 企業の収支・価格戦略の更新 ---
  Object.entries(nextAiFinances).forEach(([id, aiFin]) => {
    const sales = salesResults.aiSales[id] || { units: 0, revenue: 0 };
    const aiProduct = nextAiProducts[id];
    const aiDef = AI_COMPANIES[id];
    
    if (aiProduct && aiFin && !aiFin.isBankrupt) {
      const revenue = sales.units * aiProduct.price;
      const cost = sales.units * (aiProduct.baseCost || 70);
      const tickProfit = revenue - cost;

      // 稼働率の計算 (全市場の合計販売数 / 合計生産能力)
      const totalCapacity = Math.max(1, (aiFin.factories || 1) * 100);
      aiFin.operatingRate = sales.units / totalCapacity;
      // --- 利益計算 & 子会社/公的資金返済の処理 ---
      let finalTickProfit = tickProfit;

      // 公的資金支援を受けている場合、利益の30%を返済として徴収
      if (aiFin.isUnderBailout && finalTickProfit > 0) {
        const repayment = Math.floor(finalTickProfit * 0.3);
        finalTickProfit -= repayment;
        aiFin.bailoutTicks = (aiFin.bailoutTicks || 0) - 1;
        if (aiFin.bailoutTicks <= 0) {
          aiFin.isUnderBailout = false;
          newLogs.push({ time: dateStr, msg: `【完済】${aiDef.name}が公的資金を完済し、政府管理下から脱しました。`, type: 'info' });
        }
      }

      // 雇用維持助成金の返済処理
      if (finalTickProfit > 10000 && aiFin.subsidyDebt > 0) {
        const repayment = Math.min(aiFin.subsidyDebt, Math.floor(finalTickProfit * 0.2));
        finalTickProfit -= repayment;
        aiFin.subsidyDebt -= repayment;
        // 完済ログ（頻繁に出すぎないよう、100000以上返した時か完済時のみ出す検討もできるが、まずはシンプルに）
        if (aiFin.subsidyDebt <= 0) {
          newLogs.push({ time: dateStr, msg: `【完済】${aiDef.name}が雇用維持助成金をすべて完済しました。`, type: 'info' });
        }
      }

      // 子会社の場合は利益を親会社に送る
      if (aiFin.parentId && nextAiFinances[aiFin.parentId]) {
        nextAiFinances[aiFin.parentId].money += finalTickProfit;
        aiFin.money = Math.max(5000, aiFin.money); 
      } else {
        // 雇用維持助成金: 利益が極端に低い場合、政府が補填
        if (finalTickProfit < 2000) {
          const subsidyAmount = 2000 - finalTickProfit;
          aiFin.subsidyDebt = (aiFin.subsidyDebt || 0) + subsidyAmount;
          finalTickProfit = 2000;
        }
        aiFin.money += finalTickProfit;
      }
      
      // ... (価格設定ロジック) ...

      // --- 超大型・公的資金注入 (ラストリゾート) ---
      if (!aiFin.isBankrupt && aiFin.money < -80000 && !aiFin.hasHadBailout) {
        // 負債をすべて帳消しにした上で、$200Mを注入
        aiFin.money = 200000; 
        aiFin.hasHadBailout = true;
        aiFin.isUnderBailout = true;
        aiFin.bailoutTicks = 130; // 5年間（130ターン）
        
        newLogs.push({ 
          time: dateStr, 
          msg: `【国家救済】政府は${aiDef.name}の破滅を回避するため、巨額の負債を肩代わりし、$200Mの公的資金を注入。国家的管理下で再出発します。`, 
          type: 'warning',
          color: 'text-blue-400'
        });
      }
      
      // 利益率ベースの動的価格設定
      const currentMargin = tickProfit / (Math.abs(revenue) || 1);
      const targetMargin = aiDef?.minMargin || 0.25;
      
      if (currentMargin < targetMargin) {
        aiProduct.price = Math.round(aiProduct.price * 1.02); // 利益不足なら値上げ
      } else if (currentMargin > targetMargin + 0.2) {
        aiProduct.price = Math.round(aiProduct.price * 0.99); // 余裕があれば値下げしてシェア取り
      }
      
      // --- 救済増資 & 再建モードの判定 ---
      if (!aiFin.isBankrupt && aiFin.money < 5000 && !aiFin.isRestructuring) {
        const lastFinancing = aiFin.lastFinancingTick || 0;
        // 10年（14日×260週 = 3640日 ≒ 10年）に一度だけ実行可能
        if (newTick - lastFinancing > 260) {
          const marketCap = (aiDef.stockBase || 100) * 1000; // 簡易時価総額
          const injectAmount = Math.floor(marketCap * 0.2); // 時価総額の20%を注入
          
          aiFin.money += injectAmount;
          aiFin.isRestructuring = true;
          aiFin.restructuringTicks = 78; // 3年間（78ターン）再建モード
          aiFin.lastFinancingTick = newTick;
          aiFin.valuationPenalty = 0.7; // 時価総額 30% ダウンのペナルティ
          
          newLogs.push({ 
            time: dateStr, 
            msg: `【経営再建】${aiDef.name}が第三者割当増資を実施し、$${(injectAmount/1000).toFixed(1)}Mを確保。再建屋CEOが就任し、過激なリストラを開始。`, 
            type: 'warning',
            color: 'text-orange-400'
          });
        }
      }

      // 再建モードのカウントダウン
      if (aiFin.isRestructuring) {
        aiFin.restructuringTicks = (aiFin.restructuringTicks || 0) - 1;
        if (aiFin.restructuringTicks <= 0) {
          aiFin.isRestructuring = false;
          aiFin.valuationPenalty = 1.0; // ペナルティ解除（ただしブランド低下は残る）
          newLogs.push({ time: dateStr, msg: `【再建完了】${aiDef.name}の再建モードが終了しました。`, type: 'info' });
        }
      }

      // 倒産判定（債務超過）
      if (aiFin.money < -100000) {
        aiFin.isBankrupt = true;
        newLogs.push({ time: dateStr, msg: `【倒産】${aiDef.name}が経営破綻し、市場から撤退しました。`, type: 'error', color: 'text-red-500' });
        
        // 全市場からシェアを抹消
        Object.keys(nextMarkets).forEach(mKey => {
          const m = nextMarkets[mKey];
          if (m && m.shares) {
            if (m.shares[id]) m.shares[id] = 0;
          }
        });

        // 子会社を解放（独立）させる
        Object.values(nextAiFinances).forEach(f => {
          if (f.parentId === id) {
            f.parentId = null;
            f.money = Math.max(f.money, 10000); // 独立祝い金
          }
        });
        
        newLogs.push({ 
          time: dateStr, 
          msg: `【独立】${aiDef.name}の破綻に伴い、傘下企業が独立を宣言。再び自立した経営に乗り出しました。`, 
          type: 'info' 
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
