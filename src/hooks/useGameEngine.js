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
import { saveSystem } from '../utils/saveSystem.js';

import { processGameTick } from '../logic/engine/tickProcessor.js';

export function useGameEngine() {
  const state = useGameState();
  const {
    isPaused, setIsPaused, ticks, setTicks, gameSpeed, setGameSpeed,
    activeEvent, setActiveEvent,
    money, setMoney, stockPrice, setStockPrice,
    researchPoints, setResearchPoints, totalFactories, setTotalFactories,
    yenRate, setYenRate, euExtraCost, setEuExtraCost,
    logs, setLogs, chartData, setChartData, setLastTickProfit,
    markets, setMarkets, aiProducts, setAiProducts, aiFinances, setAiFinances,
    blueprints, productionLines, setProductionLines, inventory, setInventory,
    leadershipPower, setLeadershipPower,
    completedFocuses, setCompletedFocuses, setFlags,
    activeFocus, setActiveFocus, setUnlockedTrees,
    orgStructure, setOrgStructure, divisions, setDivisions,
  } = state;

  const currentDate    = new Date(START_DATE.getTime() + ticks * 14 * 24 * 60 * 60 * 1000);
  const currentYear    = currentDate.getFullYear();
  const currentMonth   = currentDate.getMonth() + 1;
  const currentDateStr = currentDate.toISOString().split('T')[0];

  const stateRef = useRef(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const addLog = (msg, type = 'info', color = null) => {
    setLogs(prev => {
      const isMA = (l) => l.msg.includes('【') && (l.msg.includes('提携') || l.msg.includes('買収') || l.msg.includes('統合') || l.msg.includes('独立') || l.msg.includes('再建') || l.msg.includes('再生') || l.msg.includes('子会社'));
      const combined = [{ time: currentDateStr, msg, type, color }, ...prev];
      const maLogs = combined.filter(isMA);
      const otherLogs = combined.filter(l => !isMA(l)).slice(0, 50);
      return combined.filter(l => isMA(l) || otherLogs.includes(l));
    });
  };

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
      if (!s) return;

      const result = processGameTick(s);

      if (result.type === 'EVENT') {
        setFlags(result.flags);
        setActiveEvent(result.event);
        setIsPaused(true);
        return;
      }

      const { nextState, lastTickProfit, profit, totalTickCost, calcYear, newLogs } = result;

      // ステートの一括更新
      setMoney(nextState.money);
      setResearchPoints(nextState.researchPoints);
      setLeadershipPower(nextState.leadershipPower);
      setStockPrice(nextState.stockPrice);
      setYenRate(nextState.yenRate);
      setTicks(nextState.ticks);
      setProductionLines(nextState.productionLines);
      setInventory(nextState.inventory);
      setMarkets(nextState.markets);
      setAiProducts(nextState.aiProducts);
      setAiFinances(nextState.aiFinances);
      setFlags(nextState.flags);
      setOrgStructure(nextState.orgStructure);
      setDivisions(nextState.divisions);
      setActiveFocus(nextState.activeFocus);
      setCompletedFocuses(nextState.completedFocuses);
      setUnlockedTrees(nextState.unlockedTrees);
      
      setLastTickProfit(lastTickProfit);

      if (newLogs.length > 0) {
        setLogs(prev => {
          const isMA = (l) => l.msg.includes('【') && (l.msg.includes('提携') || l.msg.includes('買収') || l.msg.includes('統合') || l.msg.includes('独立') || l.msg.includes('再建') || l.msg.includes('再生') || l.msg.includes('子会社'));
          const combined = [...newLogs, ...prev];
          const maLogs = combined.filter(isMA);
          const otherLogs = combined.filter(l => !isMA(l)).slice(0, 50);
          return combined.filter(l => isMA(l) || otherLogs.includes(l));
        });
      }

      if (nextState.ticks % 2 === 0) {
        setChartData(prev => [...prev, { 
          tick: nextState.ticks, 
          year: calcYear, 
          revenue: lastTickProfit.revenue, 
          cost: totalTickCost, 
          profit, 
          stockPrice: nextState.stockPrice, 
          money: nextState.money,
          jpShare: nextState.markets.jp.shares.player, 
          naShare: nextState.markets.na.shares.player, 
          euShare: nextState.markets.eu.shares.player
        }].slice(-200));
      }

      // 毎年1月1日にオートセーブ
      const oldYear = Math.floor(1946 + s.ticks * 14 / 365.25);
      if (calcYear > oldYear) {
        const dataToSave = {
          ...nextState,
          ticks: nextState.ticks,
          money: nextState.money,
          playerEquity: nextState.playerEquity,
          stockPrice: nextState.stockPrice,
          researchPoints: nextState.researchPoints,
          totalFactories: nextState.totalFactories,
          qualityLevel: nextState.qualityLevel,
          contentOwned: nextState.contentOwned,
          yenRate: nextState.yenRate,
          productionDebuff: nextState.productionDebuff,
          euExtraCost: nextState.euExtraCost,
          divisions: nextState.divisions,
          logs: nextState.logs,
          chartData: nextState.chartData,
          markets: nextState.markets,
          aiProducts: nextState.aiProducts,
          aiFinances: nextState.aiFinances,
          unlockedChassis: nextState.unlockedChassis,
          unlockedModules: nextState.unlockedModules,
          blueprints: nextState.blueprints,
          productionLines: nextState.productionLines,
          inventory: nextState.inventory,
          leadershipPower: nextState.leadershipPower,
          activeFocus: nextState.activeFocus,
          completedFocuses: nextState.completedFocuses,
          unlockedTrees: nextState.unlockedTrees,
          flags: nextState.flags,
          orgStructure: nextState.orgStructure,
          activeEvent: nextState.activeEvent
        };
        saveSystem.saveToSlot('auto', dataToSave);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [isPaused, activeEvent, gameSpeed]);

  const actions = useGameActions(state, addLog, currentYear);
  // 統計用の算出プロパティ
  const totalCost = (Number.isFinite(state.lastTickProfit.varCost) ? state.lastTickProfit.varCost : 0) + 
                    (Number.isFinite(state.lastTickProfit.fixedCost) ? state.lastTickProfit.fixedCost : 0) + 
                    (Number.isFinite(state.lastTickProfit.marketingCost) ? state.lastTickProfit.marketingCost : 0) + 
                    (Number.isFinite(state.lastTickProfit.storeCost) ? state.lastTickProfit.storeCost : 0) + 
                    (Number.isFinite(state.lastTickProfit.repairCost) ? state.lastTickProfit.repairCost : 0);
  
  const profit = (Number.isFinite(state.lastTickProfit.revenue) ? state.lastTickProfit.revenue : 0) - totalCost;

  return { 
    ...state, 
    currentDate, currentYear, currentMonth, currentDateStr, 
    currentEffects, currentSpirits, 
    profit, totalCost,
    ...actions, addLog, stateRef 
  };
}
