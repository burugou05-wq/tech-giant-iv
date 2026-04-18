import { useEffect, useRef, useMemo } from 'react';
import {
  START_DATE,
  HISTORICAL_EVENTS,
  SPIRIT_DEF
} from '../constants/index.js';
import { getCurrentEffects, calculateEffectiveAppeal } from '../utils/gameLogic.js';
import { useGameState } from './useGameState.js';
import { useGameActions } from './useGameActions.js';
import { simulateAI, simulateMarketShares } from '../utils/aiSimulation.js';

// 各種計算システムのインポート
import { updateOrgSystem } from '../systems/orgSystem.js';
import { updateMarketSystem, executeSales } from '../systems/marketSystem.js';
import { updateProductionSystem } from '../systems/productionSystem.js';
import { updateFinanceSystem } from '../systems/financeSystem.js';

export function useGameEngine() {
  const state = useGameState();
  const {
    isPaused, setIsPaused, ticks, setTicks, gameSpeed, setGameSpeed,
    activeEvent, setActiveEvent,
    money, setMoney, stockPrice, setStockPrice,
    researchPoints, setResearchPoints, totalFactories, setTotalFactories,
    yenRate, setYenRate, euExtraCost, setEuExtraCost,
    logs, setLogs, chartData, setChartData, setLastTickProfit,
    markets, setMarkets, aiProducts, setAiProducts,
    blueprints, productionLines, setProductionLines, inventory, setInventory,
    leadershipPower, setLeadershipPower,
    completedFocuses, setFlags,
    orgStructure, setOrgStructure, divisions, setDivisions,
  } = state;

  const currentDate    = new Date(START_DATE.getTime() + ticks * 14 * 24 * 60 * 60 * 1000);
  const currentYear    = currentDate.getFullYear();
  const currentDateStr = currentDate.toISOString().split('T')[0];

  const stateRef = useRef();
  stateRef.current = state;

  const addLog = (msg, type = 'info', color = null) => {
    setLogs(prev => [{ time: currentDateStr, msg, type, color }, ...prev].slice(0, 50));
  };

  // UI表示用の計算値
  const currentEffects = useMemo(() => getCurrentEffects(completedFocuses), [completedFocuses]);
  
  const currentSpirits = useMemo(() => {
    const s = [SPIRIT_DEF.startup];
    if (completedFocuses.includes('fc_tech_first')) s.push(SPIRIT_DEF.craftsmanship);
    if (completedFocuses.includes('fc_exp_first'))  s.push(SPIRIT_DEF.userCentric);
    if (currentYear >= 2000 && !currentEffects.siloFix) s.push(SPIRIT_DEF.bureaucracy);
    if (completedFocuses.includes('fc_one_comp'))   s.push(SPIRIT_DEF.oneCompany);
    if (state.flags.isStrike) s.push(SPIRIT_DEF.strike);
    return s;
  }, [completedFocuses, currentYear, currentEffects.siloFix, state.flags.isStrike]);

  useEffect(() => {
    if (isPaused || activeEvent) return;
    const interval = [1000, 500, 333, 250, 200][gameSpeed - 1];
    
    const timer = setInterval(() => {
      const s = stateRef.current;
      const newTick      = s.ticks + 1;
      const preciseYear  = 1946 + newTick * 14 / 365.25;
      const calcYear     = Math.floor(preciseYear);
      const dateStr      = new Date(START_DATE.getTime() + newTick * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let nextLines       = s.productionLines.map(l => ({ ...l }));
      let nextInv         = structuredClone(s.inventory);
      let nextMarkets     = structuredClone(s.markets);
      let nextAiProducts  = structuredClone(s.aiProducts);
      let nextOrgStructure = structuredClone(s.orgStructure);
      let nextDivisions   = structuredClone(s.divisions);
      let nextFlags       = { ...s.flags };
      let newLogs         = [];

      const baseEffects = getCurrentEffects(s.completedFocuses);
      const budget = nextOrgStructure.budgetAllocation || { rnd: 50, production: 50, marketing: 50, hr: 50 };

      // 1. 歴史イベントのチェック
      const pendingEvent = HISTORICAL_EVENTS.find(e => calcYear >= e.year && !nextFlags[e.flagKey]);
      if (pendingEvent) {
        nextFlags[pendingEvent.flagKey] = true; setFlags(nextFlags);
        setActiveEvent(pendingEvent); setIsPaused(true); return;
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
        isOnLine: nextLines.some(l => l.blueprintId === bp.id && l.factories > 0)
      })).filter(p => p.stock > 0 || p.isOnLine).sort((a, b) => b.app - a.app);

      simulateAI(nextAiProducts, calcYear, dateStr, newLogs);
      const totalPlayerDemandShare = simulateMarketShares(nextMarkets, nextAiProducts, sellableProducts[0] || null, calcYear, loopEffects);
      const salesResults = executeSales(nextMarkets, sellableProducts, nextInv, loopEffects, nextYenRate, s.euExtraCost);

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
        if (div.xp > div.level * 500) { div.xp -= div.level * 500; div.level = Math.min(10, div.level + 1); }
      });

      // 4. ステートの一括更新
      setMoney(prev => prev + profit);
      setResearchPoints(prev => prev + rpGain);
      setLeadershipPower(prev => prev + 1);
      setStockPrice(financeResults.newStockPrice(s.stockPrice));
      setYenRate(nextYenRate);
      setTicks(newTick);
      setProductionLines(nextLines);
      setInventory(nextInv);
      setMarkets(nextMarkets);
      setAiProducts(nextAiProducts);
      setFlags(nextFlags);
      setOrgStructure(nextOrgStructure);
      setDivisions(nextDivisions);
      setLastTickProfit({
        revenue: salesResults.currentRevenue, varCost: prodResults.currentVarCost, fixedCost: financeResults.currentFixedCost,
        marketingCost: financeResults.currentMarketingCost, storeCost: financeResults.currentStoreCost,
        repairCost: prodResults.repairCostThisTick, b2b: 0
      });
      if (newLogs.length > 0) setLogs(prev => [...newLogs.reverse(), ...prev].slice(0, 50));
      if (newTick % 2 === 0) {
        setChartData(prev => [...prev, { 
          tick: newTick, year: calcYear, revenue: salesResults.currentRevenue, cost: totalTickCost, profit, 
          stockPrice: s.stockPrice, money: s.money + profit,
          jpShare: nextMarkets.jp.shares.player, naShare: nextMarkets.na.shares.player, euShare: nextMarkets.eu.shares.player
        }].slice(-200));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [isPaused, activeEvent, gameSpeed]);

  const actions = useGameActions(state, addLog, currentYear);
  return { ...state, currentDate, currentYear, currentDateStr, currentEffects, currentSpirits, ...actions, addLog };
}
