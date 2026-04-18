import { useEffect, useRef, useMemo } from 'react';
import {
  START_DATE, CHASSIS_TECH,
  CORPORATE_FOCUSES, SPIRIT_DEF,
  HISTORICAL_EVENTS, RANDOM_EVENTS,
  AI_COMPANIES,
} from '../constants/index.js';
import { getCurrentEffects, calculateEffectiveAppeal } from '../utils/gameLogic.js';
import { useGameState } from './useGameState.js';
import { useGameActions } from './useGameActions.js';
import { simulateAI, simulateMarketShares } from '../utils/aiSimulation.js';

export function useGameEngine() {
  const state = useGameState();
  const {
    isPaused, setIsPaused, ticks, setTicks, gameSpeed, setGameSpeed,
    activeEvent, setActiveEvent,
    money, setMoney, playerEquity, setPlayerEquity, stockPrice, setStockPrice,
    researchPoints, setResearchPoints, totalFactories, setTotalFactories,
    qualityLevel, setQualityLevel, contentOwned, setContentOwned,
    yenRate, setYenRate, productionDebuff, setProductionDebuff, euExtraCost, setEuExtraCost,
    divisions, setDivisions,
    logs, setLogs, chartData, setChartData, lastTickProfit, setLastTickProfit,
    markets, setMarkets, aiProducts, setAiProducts,
    unlockedChassis, setUnlockedChassis, unlockedModules, setUnlockedModules,
    blueprints, setBlueprints, productionLines, setProductionLines, inventory, setInventory,
    leadershipPower, setLeadershipPower, activeFocus, setActiveFocus,
    completedFocuses, setCompletedFocuses, selectedFocusDetails, setSelectedFocusDetails,
    unlockedTrees, setUnlockedTrees, flags, setFlags,
    orgStructure, setOrgStructure,
  } = state;

  const currentDate    = new Date(START_DATE.getTime() + ticks * 14 * 24 * 60 * 60 * 1000);
  const currentYear    = currentDate.getFullYear();
  const currentDateStr = currentDate.toISOString().split('T')[0];

  const orgDerived = useMemo(() => {
    const budget = orgStructure.budgetAllocation || { rnd: 50, production: 50, marketing: 50, hr: 50 };
    const depts = orgStructure.departments;
    const avgEfficiency = (depts.rnd.efficiency + depts.production.efficiency + depts.marketing.efficiency + depts.hr.efficiency) / 4;
    const avgCoordination = (depts.rnd.coordination + depts.production.coordination + depts.marketing.coordination + depts.hr.coordination) / 4;
    const avgMorale = (depts.rnd.morale + depts.production.morale + depts.marketing.morale + depts.hr.morale) / 4;
    const riskFactor = 1.0 - Math.min(0.25, orgStructure.siloRisk * 0.0025);
    const budgetMult = (key) => 0.5 + budget[key] / 100;
    return {
      orgProductivity: (0.8 + avgEfficiency * 0.2) * riskFactor * budgetMult('production'),
      orgInnovation: (0.8 + avgMorale * 0.002) * riskFactor * budgetMult('rnd'),
      orgCoordination: (0.75 + avgCoordination * 0.25) * riskFactor * budgetMult('marketing'),
    };
  }, [orgStructure]);

  const currentEffects = useMemo(() => ({
    ...getCurrentEffects(completedFocuses),
    ...orgDerived,
  }), [completedFocuses, orgDerived]);

  const stateRef = useRef();
  stateRef.current = {
    ticks, blueprints, productionLines, inventory, markets, aiProducts, logs, money,
    researchPoints, playerEquity, stockPrice, yenRate, productionDebuff, euExtraCost,
    qualityLevel, contentOwned, flags, chartData, totalFactories,
    leadershipPower, activeFocus, completedFocuses, unlockedTrees,
    orgStructure, divisions,
  };

  const addLog = (msg, type = 'info', color = null) => {
    setLogs(prev => [{ time: currentDateStr, msg, type, color }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    if (isPaused || activeEvent) return;
    const intervals = [1000, 500, 333, 250, 200];
    const interval = intervals[gameSpeed - 1];
    const timer = setInterval(() => {
      const s = stateRef.current;
      const newTick      = s.ticks + 1;
      const preciseYear  = 1946 + newTick * 14 / 365.25;
      const calcYear     = Math.floor(preciseYear);
      const dateStr      = new Date(START_DATE.getTime() + newTick * 14 * 24 * 60 * 60 * 1000)
                             .toISOString().split('T')[0];

      // Replace JSON.parse(JSON.stringify) with structuredClone
      let nextLines           = s.productionLines.map(l => ({ ...l }));
      let nextInv             = structuredClone(s.inventory);
      let nextMarkets         = structuredClone(s.markets);
      let nextAiProducts      = structuredClone(s.aiProducts);
      let newLogs             = [];
      let nextFlags           = { ...s.flags };
      let nextCompletedFocuses = [...s.completedFocuses];
      let nextActiveFocus     = s.activeFocus ? { ...s.activeFocus } : null;
      let nextUnlockedTrees   = [...s.unlockedTrees];
      let nextOrgStructure    = structuredClone(s.orgStructure);
      let nextDivisions       = structuredClone(s.divisions);

      let currentVarCost = 0, currentFixedCost = 0, currentMarketingCost = 0;
      let currentStoreCost = 0, currentRevenue = 0, b2bRevenue = 0;
      let repairCostThisTick = 0, instantMoneyGain = 0;

      const baseEffects   = getCurrentEffects(nextCompletedFocuses);
      if (!nextOrgStructure.budgetAllocation) {
        nextOrgStructure.budgetAllocation = { rnd: 50, production: 50, marketing: 50, hr: 50 };
      }
      const budget = nextOrgStructure.budgetAllocation;
      const budgetMult = (key) => 0.5 + budget[key] / 100;
      const nextOrgEfficiency = (nextOrgStructure.departments.rnd.efficiency + nextOrgStructure.departments.production.efficiency + nextOrgStructure.departments.marketing.efficiency + nextOrgStructure.departments.hr.efficiency) / 4;
      const nextOrgCoordination = (nextOrgStructure.departments.rnd.coordination + nextOrgStructure.departments.production.coordination + nextOrgStructure.departments.marketing.coordination + nextOrgStructure.departments.hr.coordination) / 4;
      const nextOrgMorale = (nextOrgStructure.departments.rnd.morale + nextOrgStructure.departments.production.morale + nextOrgStructure.departments.marketing.morale + nextOrgStructure.departments.hr.morale) / 4;
      const riskFactor = 1.0 - Math.min(0.25, nextOrgStructure.siloRisk * 0.0025);
      const orgLoopEffects = {
        orgProductivity: (0.8 + nextOrgEfficiency * 0.2) * riskFactor * budgetMult('production'),
        orgInnovation: (0.8 + nextOrgMorale * 0.002) * riskFactor * budgetMult('rnd'),
        orgCoordination: (0.75 + nextOrgCoordination * 0.25) * riskFactor * budgetMult('marketing'),
      };
      const loopEffects  = { ...baseEffects, ...orgLoopEffects };
      const isSiloActive = calcYear >= 2000 && !baseEffects.siloFix;

      // Historical events logic
      const pendingEvent = HISTORICAL_EVENTS.find(e => calcYear >= e.year && !nextFlags[e.flagKey]);
      if (pendingEvent) {
        nextFlags[pendingEvent.flagKey] = true;
        setActiveEvent(pendingEvent);
        setFlags(nextFlags);
        setIsPaused(true);
        return;
      }

      if (nextActiveFocus) {
        nextActiveFocus.progress += 1;
        const focusData = CORPORATE_FOCUSES.find(f => f.id === nextActiveFocus.id);
        if (nextActiveFocus.progress >= focusData.lpCost) {
          nextCompletedFocuses.push(nextActiveFocus.id);
          newLogs.push({ time: dateStr, msg: '企業方針「' + focusData.name + '」を達成！', type: 'info', color: 'text-green-400' });
          if (focusData.effects.instantMoney) instantMoneyGain += focusData.effects.instantMoney;
          if (focusData.effects.unlockTree && !nextUnlockedTrees.includes(focusData.effects.unlockTree)) {
            nextUnlockedTrees.push(focusData.effects.unlockTree);
          }
          nextActiveFocus = null;
        }
      }

      let rpGain = (15 + Math.floor((calcYear - 1946) / 3)) * loopEffects.rpMulti * loopEffects.orgInnovation;
      if (isSiloActive) rpGain *= 0.5;

      if (loopEffects.openB2B) {
        b2bRevenue  = 200 + Math.max(0, calcYear - 1990) * 50;
        currentRevenue += b2bRevenue;
      }

      const nextYenRate = Math.max(0.6, Math.min(1.5, s.yenRate + (Math.random() - 0.5) * 0.01));

      if (calcYear >= 2000 && !baseEffects.siloFix) {
        nextOrgStructure.siloRisk = Math.min(100, Math.max(0, nextOrgStructure.siloRisk + 0.6 - (budget.hr / 83.3)));
        Object.keys(nextOrgStructure.departments).forEach(key => {
          const dept = nextOrgStructure.departments[key];
          dept.morale = Math.max(40, dept.morale - 0.2 - Math.random() * 0.3);
          dept.coordination = Math.max(0.4, dept.coordination - 0.003 - Math.random() * 0.004);
        });
        if (!nextFlags.siloNoticed && nextOrgStructure.siloRisk >= 30) {
          newLogs.push({ time: dateStr, msg: '組織のサイロ化が進み、部門連携が低下しています。人事への予算を増やしてください。', type: 'alert', color: 'text-red-400' });
          nextFlags.siloNoticed = true;
        }
      } else if (baseEffects.siloFix) {
        nextOrgStructure.siloRisk = Math.max(0, nextOrgStructure.siloRisk - 1.5);
        Object.keys(nextOrgStructure.departments).forEach(key => {
          const dept = nextOrgStructure.departments[key];
          dept.morale = Math.min(100, dept.morale + 0.15);
          dept.coordination = Math.min(1.0, dept.coordination + 0.003);
        });
      } else {
        const hrMult = budget.hr / 50;
        if (hrMult < 1) {
          nextOrgStructure.siloRisk = Math.min(100, nextOrgStructure.siloRisk + 0.1 * (1 - hrMult));
        } else {
          nextOrgStructure.siloRisk = Math.max(0, nextOrgStructure.siloRisk - 0.3 * hrMult);
        }
      }

      Object.keys(nextMarkets).forEach(k => {
        if (nextMarkets[k].locked) return;
        let baseDemand   = 1000;
        const yearsPassed = Math.max(0, preciseYear - 1946);
        if (k === 'na')      baseDemand = 1500 + yearsPassed * 200 + Math.pow(yearsPassed, 1.65) * 4;
        else if (k === 'eu') baseDemand = 1200 + yearsPassed * 140 + Math.pow(yearsPassed, 1.55) * 2.5;
        else if (k === 'jp') {
          baseDemand = 800 + yearsPassed * 70;
          if (preciseYear >= 1986 && preciseYear <= 1992) {
            if (!nextFlags.bubbleStarted) {
              newLogs.push({ time: dateStr, msg: '【好景気】日本市場でバブル到来！', type: 'info', color: 'text-yellow-400' });
              nextFlags.bubbleStarted = true;
            }
            baseDemand += Math.max(0, 1 - Math.abs(preciseYear - 1989) / 3) * 2500;
          } else if (preciseYear > 1992) {
            baseDemand = 2000 + (preciseYear - 1992) * 25;
          }
        }
        
        // Dot-com bubble burst impact
        if (calcYear >= 2000 && calcYear <= 2002 && k !== 'jp') {
          baseDemand *= 0.7;
        }
        // Lehman shock impact
        if (calcYear >= 2008 && calcYear <= 2010) {
          baseDemand *= 0.6;
        }
        
        nextMarkets[k].demand = Math.floor(
          nextMarkets[k].demand * 0.85 + (baseDemand * (0.92 + Math.random() * 0.16)) * 0.15
        );
      });

      const orgOverheadCost = Object.keys(budget).reduce((sum, key) => {
        return sum + (budget[key] - 50) * 20;
      }, 0);
      const baseCost = ((s.totalFactories * 60) + (150 + (calcYear - 1946) * 15)) * loopEffects.factoryCostMulti;
      currentFixedCost = Math.max(baseCost * 0.3, baseCost + orgOverheadCost);
      Object.keys(nextMarkets).forEach(k => {
        if (nextMarkets[k].locked) return;
        currentMarketingCost += nextMarkets[k].marketing * 150 * loopEffects.marketingMulti;
        currentStoreCost     += nextMarkets[k].stores    * 400;
      });

      if (newTick > 30 && newTick % 40 === 0 && Math.random() < 0.15 && !nextFlags.isStrike) {
        const availableEvents = RANDOM_EVENTS.filter(e => !e.condition || e.condition(s, calcYear));
        if (availableEvents.length > 0) {
          setActiveEvent(availableEvents[Math.floor(Math.random() * availableEvents.length)]);
          setIsPaused(true); return;
        }
      }

      nextLines.forEach(line => {
        if (line.factories === 0) return;
        const bp = s.blueprints.find(b => b.id === line.blueprintId);
        if (!bp) return;

        let effTarget = isSiloActive ? 70 : 100;
        if (nextActiveFocus?.id === 'fc_one_comp') effTarget = 40;
        line.efficiency = Math.min(effTarget, line.efficiency + (effTarget - line.efficiency) * 0.05 * loopEffects.orgProductivity);
        if (line.efficiency > effTarget) line.efficiency -= 5;

        const prodMult = nextFlags.isStrike ? 0.3 : 1.0;
        const produced = Math.floor(line.factories * 40 * (line.efficiency / 100) * prodMult);
        if (!nextInv[bp.id]) nextInv[bp.id] = { amount: 0, sold: 0 };
        nextInv[bp.id].amount += produced;

        const effectiveQuality = Math.min(s.qualityLevel, loopEffects.qualityCap);
        const chassis    = CHASSIS_TECH.find(c => c.id === bp.chassisId);
        const smartMult  = chassis?.category === 'smart_device' ? loopEffects.smartphoneCostMulti : 1.0;
        const costMod    = (effectiveQuality / 80) * loopEffects.costMulti * smartMult;
        currentVarCost  += produced * bp.cost * costMod / loopEffects.orgProductivity;

        const defectRate = (100 - effectiveQuality) / 200;
        if (Math.random() < defectRate && produced > 0) {
          repairCostThisTick += produced * bp.cost * 1.5;
        }
      });

      currentFixedCost += repairCostThisTick;

      const activeBlueprints = s.blueprints.filter(bp =>
        nextLines.some(l => l.blueprintId === bp.id && l.factories > 0)
      );
      const bestItem = activeBlueprints.reduce((best, bp) => {
        const app = calculateEffectiveAppeal(bp, calcYear, s.contentOwned, loopEffects);
        return app > (best?.app || 0) ? { bp, app } : best;
      }, null);

      // --- AI Simulation & Market Shares (Extracted) ---
      simulateAI(nextAiProducts, calcYear, dateStr, newLogs);
      const totalPlayerDemandShare = simulateMarketShares(nextMarkets, nextAiProducts, bestItem, calcYear, loopEffects);

      Object.keys(nextMarkets).forEach(mKey => {
        const m = nextMarkets[mKey];
        if (m.locked) return;
        let demand   = Math.floor(m.demand * m.shares.player);
        let revMulti = 1.0;
        if (loopEffects.propBonus) {
          if (m.shares.player >= 0.5) revMulti = 1.5;
          else demand = Math.floor(demand * 0.6);
        }

        if (bestItem && demand > 0) {
          if (!nextInv[bestItem.bp.id]) nextInv[bestItem.bp.id] = { amount: 0, sold: 0 };
          const sold = Math.min(nextInv[bestItem.bp.id]?.amount || 0, demand);
          if (sold > 0) {
            nextInv[bestItem.bp.id].amount -= sold;
            nextInv[bestItem.bp.id].sold   += sold;
            let revenue = sold * bestItem.bp.cost * 2.5 * revMulti;
            if (mKey !== 'jp') revenue /= nextYenRate;
            currentRevenue += revenue;
            if (mKey === 'eu' && s.euExtraCost > 0) {
              currentVarCost += sold * s.euExtraCost;
            }
          }
        }
      });

      // Divisions Processing
      const activeDivCount = Object.values(nextDivisions).filter(d => d.active).length;
      Object.keys(nextDivisions).forEach(cat => {
        const div = nextDivisions[cat];
        if (!div.active) return;
        
        let catProdLines = nextLines.filter(l => {
          if (l.factories === 0) return false;
          const bp = s.blueprints.find(b => b.id === l.blueprintId);
          if (!bp) return false;
          const ch = CHASSIS_TECH.find(c => c.id === bp.chassisId);
          return ch && ch.category === cat;
        });
        
        if (catProdLines.length > 0) {
          div.xp += catProdLines.reduce((sum, l) => sum + l.factories, 0);
          if (div.xp > div.level * 500) {
            div.xp -= div.level * 500;
            div.level = Math.min(10, div.level + 1);
            newLogs.push({ time: dateStr, msg: `【事業部成長】${div.name}のレベルが ${div.level} に上がりました！`, type: 'info', color: 'text-indigo-300' });
          }
        }
        
        // Divisional morale trend towards budget share
        const fairShare = 100 / activeDivCount;
        const targetMorale = 40 + (div.budgetShare / Math.max(1, fairShare)) * 40; // if fair, target is 80. if double, 120.
        div.morale = Math.min(100, Math.max(0, div.morale + (Math.min(100, targetMorale) - div.morale) * 0.05));
      });

      if (!nextFlags.patentDispute && totalPlayerDemandShare > 0.45 && Object.keys(nextMarkets).some(mKey => {
        const m = nextMarkets[mKey];
        const competitor = Object.keys(AI_COMPANIES).find(c => AI_COMPANIES[c].strongMarket === mKey);
        return m.shares.player > 0.45 && competitor && m.shares[competitor] > 0.2;
      }) && Math.random() < 0.015) {
        setActiveEvent(RANDOM_EVENTS.find(e => e.id === 'patent_lawsuit'));
        setIsPaused(true);
        return;
      }

      const totalTickCost = currentVarCost + currentFixedCost + currentMarketingCost + currentStoreCost;
      const profit        = currentRevenue - totalTickCost;

      setMoney(prev => prev + profit + instantMoneyGain);
      setResearchPoints(prev => prev + rpGain);
      setLeadershipPower(prev => prev + 1);
      setStockPrice(prev => Math.max(10, Math.min(10000,
        prev + profit / 5000 + (totalPlayerDemandShare - 0.7) * 4
      )));
      setYenRate(nextYenRate);
      setTicks(newTick);
      setProductionLines(nextLines);
      setInventory(nextInv);
      setMarkets(nextMarkets);
      setAiProducts(nextAiProducts);
      setFlags(nextFlags);
      setOrgStructure(nextOrgStructure);
      setDivisions(nextDivisions);
      setActiveFocus(nextActiveFocus);
      setCompletedFocuses(nextCompletedFocuses);
      setUnlockedTrees(nextUnlockedTrees);
      setLastTickProfit({
        revenue: currentRevenue, varCost: currentVarCost, fixedCost: currentFixedCost,
        marketingCost: currentMarketingCost, storeCost: currentStoreCost,
        repairCost: repairCostThisTick, b2b: b2bRevenue,
      });
      if (newLogs.length > 0) setLogs(prev => [...newLogs.reverse(), ...prev].slice(0, 50));
      if (newTick % 2 === 0) {
        setChartData(prev =>
          [...prev, { tick: newTick, revenue: currentRevenue, cost: totalTickCost, profit, stockPrice: s.stockPrice }].slice(-40)
        );
      }
      if (loopEffects.openOverseas) {
        nextMarkets.na.locked = false;
        nextMarkets.eu.locked = false;
      }
    }, interval);
    return () => clearInterval(timer);
  }, [isPaused, activeEvent, gameSpeed]);

  const actions = useGameActions(state, addLog, currentYear);

  const currentSpirits = (() => {
    const s = [SPIRIT_DEF.startup];
    if (completedFocuses.includes('fc_tech_first')) s.push(SPIRIT_DEF.craftsmanship);
    if (completedFocuses.includes('fc_exp_first'))  s.push(SPIRIT_DEF.userCentric);
    if (currentYear >= 2000 && !currentEffects.siloFix) s.push(SPIRIT_DEF.bureaucracy);
    if (completedFocuses.includes('fc_one_comp'))   s.push(SPIRIT_DEF.oneCompany);
    if (flags.isStrike) s.push(SPIRIT_DEF.strike);
    return s;
  })();

  return {
    ...state,
    currentDate, currentYear, currentDateStr,
    orgDerived, currentEffects, stateRef, currentSpirits,
    ...actions, addLog
  };
}
