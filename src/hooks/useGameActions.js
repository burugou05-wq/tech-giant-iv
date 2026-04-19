// @ts-check
import { createMarketActions } from '../actions/marketActions.js';
import { createOrgActions } from '../actions/orgActions.js';
import { createTechActions } from '../actions/techActions.js';
import { createEventActions } from '../actions/eventActions.js';
import { saveSystem } from '../utils/saveSystem.js';

/**
 * ゲームのアクションを統合するフック
 * @param {ReturnType<typeof import('./useGameState.js').useGameState>} state 
 * @param {Function} addLog 
 * @param {number} currentYear 
 */
export function useGameActions(state, addLog, currentYear) {
  const {
    money, setMoney, leadershipPower, setLeadershipPower,
    setStockPrice, setEuExtraCost, setFlags,
    completedFocuses, blueprints, loadFullState
  } = state;

  // 各アクションドメインの初期化
  const marketActions = createMarketActions(state, addLog);
  const orgActions = createOrgActions(state, addLog);
  const techActions = createTechActions(state, addLog, currentYear);
  const eventActions = createEventActions(state, addLog);

  /**
   * ディシジョン（特殊な一回限りの命令）の実行
   * @param {any} dec 
   */
  const executeDecision = (dec) => {
    if (leadershipPower < dec.lpCost || money < dec.moneyCost) return;
    
    setLeadershipPower(prev => prev - dec.lpCost);
    setMoney(prev => prev - dec.moneyCost);
    
    // アクションに応じた振り分け
    switch (dec.action) {
      case 'buy_stock': 
        setStockPrice(prev => prev * 1.2); 
        break;
      case 'lobby_eu': 
        setEuExtraCost(0); 
        break;
      case 'end_strike': 
        setFlags(prev => ({ ...prev, isStrike: false })); 
        break;
      case 'mega_ad': 
        marketActions.executeMegaAd(); 
        break;
      case 'internal_reform': 
        orgActions.executeInternalReform(); 
        break;
      case 'price_war': 
        marketActions.executePriceWar(); 
        break;
    }
    addLog(`ディシジョン「${dec.name}」を実行しました。`, 'info', 'text-indigo-400');
  };

  /**
   * ゲームの保存
   * @param {number|string} slot 
   */
  const saveGame = (slot) => {
    // 保存対象のステートを抽出
    const dataToSave = {
      ticks: state.ticks,
      money: state.money,
      playerEquity: state.playerEquity,
      stockPrice: state.stockPrice,
      researchPoints: state.researchPoints,
      totalFactories: state.totalFactories,
      qualityLevel: state.qualityLevel,
      contentOwned: state.contentOwned,
      yenRate: state.yenRate,
      productionDebuff: state.productionDebuff,
      euExtraCost: state.euExtraCost,
      divisions: state.divisions,
      logs: state.logs,
      chartData: state.chartData,
      markets: state.markets,
      aiProducts: state.aiProducts,
      aiFinances: state.aiFinances,
      unlockedChassis: state.unlockedChassis,
      unlockedModules: state.unlockedModules,
      blueprints: state.blueprints,
      productionLines: state.productionLines,
      inventory: state.inventory,
      leadershipPower: state.leadershipPower,
      activeFocus: state.activeFocus,
      completedFocuses: state.completedFocuses,
      unlockedTrees: state.unlockedTrees,
      flags: state.flags,
      orgStructure: state.orgStructure,
      activeEvent: state.activeEvent
    };
    const success = saveSystem.saveToSlot(slot, dataToSave);
    if (success) {
      addLog(`ゲームをスロット ${slot} に保存しました。`, 'success', 'text-emerald-400');
    }
    return success;
  };

  /**
   * ゲームの読み込み
   * @param {number|string} slot 
   */
  const loadGame = (slot) => {
    const loadedState = saveSystem.loadFromSlot(slot);
    if (loadedState) {
      loadFullState(loadedState);
      addLog(`スロット ${slot} からデータを読み込みました。`, 'success', 'text-emerald-400');
      return true;
    }
    return false;
  };

  // すべてのアクションをフラットに統合して返す
  return {
    ...marketActions,
    ...orgActions,
    ...techActions,
    ...eventActions,
    executeDecision,
    saveGame,
    loadGame,
    getSlotInfo: saveSystem.getSlotInfo,
    deleteSlot: saveSystem.deleteSlot,
    // 一部の固有ラッパー
    /** @param {'jp'|'na'|'eu'} mKey */
    buildDirectStore: (mKey) => marketActions.buildDirectStore(mKey, completedFocuses),
    /** @param {'jp'|'na'|'eu'} mKey */
    closeDirectStore: (mKey) => marketActions.closeDirectStore(mKey, completedFocuses),
    /** @param {string} divId */
    sellSubsidiary: (divId) => orgActions.sellSubsidiary(divId, blueprints),
  };
}
