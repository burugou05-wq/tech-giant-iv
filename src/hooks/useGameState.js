// @ts-check
import { useState } from 'react';
import { AI_COMPANIES } from '../constants/companies/index.js';

const INITIAL_AI_PRODUCTS = Object.fromEntries(
  Object.entries(AI_COMPANIES).map(([id, ai]) => [id, { 
    id: `${id}_init`,
    companyId: id,
    name: `${ai.name} Classic`,
    appeal: 10, 
    price: 100,
    baseCost: 70,
    techLevel: 1946,
    category: 'home_appliance',
    launchYear: 1946 
  }])
);

const INITIAL_AI_FINANCES = Object.fromEntries(
  Object.entries(AI_COMPANIES).map(([id, ai]) => [id, {
    money: (ai && typeof ai.initialMoney === 'number') ? ai.initialMoney : 100000,
    isBankrupt: false,
    activeMarkets: Object.keys(ai.regions || { jp: 0 }),
    factories: ai.initialFactories || Math.max(5, Math.floor(((ai && ai.initialMoney) || 100000) / 15000)), // 個別設定があればそれを使用
    operatingRate: 0.8 // 初期は 80% 稼働
  }])
);

export function useGameState() {
  const [isPaused, setIsPaused]   = useState(false);
  const [ticks, setTicks]         = useState(0);
  const [gameSpeed, setGameSpeed] = useState(3);
  const [activeEvent, setActiveEvent] = useState(/** @type {any} */ (null));
  const [theme, setTheme]             = useState("dark");

  const [money, setMoney]                   = useState(15000);
  const [playerEquity, setPlayerEquity]     = useState(100);
  const [stockPrice, setStockPrice]         = useState(100);
  const [researchPoints, setResearchPoints] = useState(0);
  const [totalFactories, setTotalFactories] = useState(10);
  const [qualityLevel, setQualityLevel]     = useState(80);
  const [contentOwned, setContentOwned]     = useState(/** @type {string[]} */ ([]));
  const [yenRate, setYenRate]               = useState(1.0);
  const [productionDebuff, setProductionDebuff] = useState(1.0);
  const [euExtraCost, setEuExtraCost]       = useState(0);
  const [divisions, setDivisions] = useState({
    home_appliance: { name: '白物家電', active: true,  budgetShare: 100, level: 1, morale: 100, xp: 0 },
    audio:          { name: 'オーディオ', active: false, budgetShare: 0,   level: 1, morale: 100, xp: 0 },
    video:          { name: '映像機器', active: false, budgetShare: 0,   level: 1, morale: 100, xp: 0 },
    digital:        { name: 'デジタル', active: false, budgetShare: 0,   level: 1, morale: 100, xp: 0 },
    game_console:   { name: 'エンタメ', active: false, budgetShare: 0,   level: 1, morale: 100, xp: 0 },
    smart_device:   { name: 'モバイル', active: false, budgetShare: 0,   level: 1, morale: 100, xp: 0 },
  });
  const [logs, setLogs] = useState([{
    time: '1946-05-07',
    msg: '東京通信工業設立。真面目なる技術者の技能を最高度に発揮せしむべき自由闊達にして愉快なる理想工場の建設。',
    type: 'info',
  }]);
  const [chartData, setChartData]   = useState(/** @type {any[]} */ ([]));
  const [lastTickProfit, setLastTickProfit] = useState({
    revenue: 0, varCost: 0, fixedCost: 0, marketingCost: 0, storeCost: 0, repairCost: 0, b2b: 0,
  });

  // --- Market ---
  const [markets, setMarkets] = useState({
    jp: { name: '日本市場', demand: 800,  shares: { player: 0, toshiba: 0.3, panasonic: 0.4, hitachi: 0.3 }, marketing: 0, stores: 0, locked: false, category: 'home_appliance' },
    na: { name: '北米市場', demand: 1500, shares: { player: 0, motorola: 0.4, ge: 0.6 }, marketing: 0, stores: 0, locked: true, category: 'home_appliance' },
    eu: { name: '欧州市場', demand: 1200, shares: { player: 0, philips: 0.6, siemens: 0.4 }, marketing: 0, stores: 0, locked: true, category: 'home_appliance' },
    cn: { name: '中国市場', demand: 0,    shares: { player: 0 }, marketing: 0, stores: 0, locked: true, category: 'home_appliance' },
  });
  const [aiProducts, setAiProducts] = useState(INITIAL_AI_PRODUCTS);
  const [aiFinances, setAiFinances] = useState(INITIAL_AI_FINANCES);

  // --- Research & Production ---
  const [unlockedChassis, setUnlockedChassis]   = useState(['ch_rice_cooker']);
  const [unlockedModules, setUnlockedModules]   = useState(['mod_wood_box', 'mod_heater_wire']);
  const [blueprints, setBlueprints]             = useState(/** @type {any[]} */ ([]));
  const [productionLines, setProductionLines]   = useState(/** @type {any[]} */ ([]));
  const [inventory, setInventory]               = useState(/** @type {Record<string,{amount:number,sold:number}>} */ ({}));

  // --- Corporate ---
  const [leadershipPower, setLeadershipPower]       = useState(0);
  const [activeFocus, setActiveFocus]               = useState(/** @type {{id: string, progress: number} | null} */ (null));
  const [completedFocuses, setCompletedFocuses]     = useState(/** @type {string[]} */ ([]));
  const [selectedFocusDetails, setSelectedFocusDetails] = useState(/** @type {any} */ (null));
  const [unlockedTrees, setUnlockedTrees]           = useState(['main']);
  const [flags, setFlags] = useState({
    bubbleStarted: false, bubbleBurst: false, siloNoticed: false, spShocked: false,
    isStrike: false, patentDispute: false,
    koreanWarBoom: false, tokyoOlympics: false, oilShock: false,
    plazaAccord: false, dotComBubble: false, lehmanShock: false,
  });

  // --- Organization ---
  const [orgStructure, setOrgStructure] = useState({
    budgetAllocation: { rnd: 50, production: 50, marketing: 50, hr: 50 },
    departments: {
      rnd:        { name: 'R&D',   efficiency: 1.0, morale: 100, coordination: 1.0 },
      production: { name: '生産', efficiency: 1.0, morale: 100, coordination: 1.0 },
      marketing:  { name: 'マーケ', efficiency: 1.0, morale: 100, coordination: 1.0 },
      hr:         { name: '人事', efficiency: 1.0, morale: 100, coordination: 1.0 },
    },
    siloRisk: 0,
  });

  /** @param {any} s */
  const loadFullState = (s) => {
    if (!s) return;
    if (s.money !== undefined) setMoney(s.money);
    if (s.ticks !== undefined) setTicks(s.ticks);
    if (s.playerEquity !== undefined) setPlayerEquity(s.playerEquity);
    if (s.stockPrice !== undefined) setStockPrice(s.stockPrice);
    if (s.researchPoints !== undefined) setResearchPoints(s.researchPoints);
    if (s.totalFactories !== undefined) setTotalFactories(s.totalFactories);
    if (s.qualityLevel !== undefined) setQualityLevel(s.qualityLevel);
    if (s.contentOwned !== undefined) setContentOwned(s.contentOwned);
    if (s.yenRate !== undefined) setYenRate(s.yenRate);
    if (s.productionDebuff !== undefined) setProductionDebuff(s.productionDebuff);
    if (s.euExtraCost !== undefined) setEuExtraCost(s.euExtraCost);
    if (s.divisions !== undefined) setDivisions(s.divisions);
    if (s.logs !== undefined) setLogs(s.logs);
    if (s.chartData !== undefined) setChartData(s.chartData);
    if (s.markets !== undefined) setMarkets(s.markets);
    if (s.aiProducts !== undefined) setAiProducts(s.aiProducts);
    if (s.aiFinances !== undefined) setAiFinances(s.aiFinances);
    if (s.unlockedChassis !== undefined) setUnlockedChassis(s.unlockedChassis);
    if (s.unlockedModules !== undefined) setUnlockedModules(s.unlockedModules);
    if (s.blueprints !== undefined) setBlueprints(s.blueprints);
    if (s.productionLines !== undefined) setProductionLines(s.productionLines);
    if (s.inventory !== undefined) setInventory(s.inventory);
    if (s.leadershipPower !== undefined) setLeadershipPower(s.leadershipPower);
    if (s.activeFocus !== undefined) setActiveFocus(s.activeFocus);
    if (s.completedFocuses !== undefined) setCompletedFocuses(s.completedFocuses);
    if (s.unlockedTrees !== undefined) setUnlockedTrees(s.unlockedTrees);
    if (s.flags !== undefined) setFlags(s.flags);
    if (s.orgStructure !== undefined) setOrgStructure(s.orgStructure);
    if (s.activeEvent !== undefined) setActiveEvent(s.activeEvent);
  };

  return {
    isPaused, setIsPaused, ticks, setTicks, gameSpeed, setGameSpeed,
    activeEvent, setActiveEvent,
    money, setMoney, playerEquity, setPlayerEquity, stockPrice, setStockPrice,
    researchPoints, setResearchPoints, totalFactories, setTotalFactories,
    qualityLevel, setQualityLevel, contentOwned, setContentOwned,
    yenRate, setYenRate, productionDebuff, setProductionDebuff, euExtraCost, setEuExtraCost,
    divisions, setDivisions,
    logs, setLogs, chartData, setChartData, lastTickProfit, setLastTickProfit,
    markets, setMarkets, aiProducts, setAiProducts, aiFinances, setAiFinances,
    unlockedChassis, setUnlockedChassis, unlockedModules, setUnlockedModules,
    blueprints, setBlueprints, productionLines, setProductionLines, inventory, setInventory,
    leadershipPower, setLeadershipPower, activeFocus, setActiveFocus,
    completedFocuses, setCompletedFocuses, selectedFocusDetails, setSelectedFocusDetails,
    unlockedTrees, setUnlockedTrees, flags, setFlags,
    orgStructure, setOrgStructure,
    theme, setTheme,
    loadFullState
  };
}
