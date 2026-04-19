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
    markets, setMarkets, aiProducts, setAiProducts,
    blueprints, productionLines, setProductionLines, inventory, setInventory,
    leadershipPower, setLeadershipPower,
    completedFocuses, setFlags,
    orgStructure, setOrgStructure, divisions, setDivisions,
  } = state;

  const currentDate    = new Date(START_DATE.getTime() + ticks * 14 * 24 * 60 * 60 * 1000);
  const currentYear    = currentDate.getFullYear();
  const currentDateStr = currentDate.toISOString().split('T')[0];

  const stateRef = useRef(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const addLog = (msg, type = 'info', color = null) => {
    setLogs(prev => [{ time: currentDateStr, msg, type, color }, ...prev].slice(0, 50));
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
      setFlags(nextState.flags);
      setOrgStructure(nextState.orgStructure);
      setDivisions(nextState.divisions);
      
      setLastTickProfit(lastTickProfit);

      if (newLogs.length > 0) {
        setLogs(prev => [...newLogs, ...prev].slice(0, 50));
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
    }, interval);
    return () => clearInterval(timer);
  }, [isPaused, activeEvent, gameSpeed]);

  const actions = useGameActions(state, addLog, currentYear);
  return { ...state, currentDate, currentYear, currentDateStr, currentEffects, currentSpirits, ...actions, addLog, stateRef };
}
