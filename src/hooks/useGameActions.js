// @ts-check
import { createMarketActions } from '../actions/marketActions.js';
import { createOrgActions } from '../actions/orgActions.js';
import { createTechActions } from '../actions/techActions.js';
import { createEventActions } from '../actions/eventActions.js';

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
    completedFocuses, blueprints
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

  // すべてのアクションをフラットに統合して返す
  return {
    ...marketActions,
    ...orgActions,
    ...techActions,
    ...eventActions,
    executeDecision,
    // 一部の固有ラッパー
    buildDirectStore: (mKey) => marketActions.buildDirectStore(mKey, completedFocuses),
    closeDirectStore: (mKey) => marketActions.closeDirectStore(mKey, completedFocuses),
    sellSubsidiary: (divId) => orgActions.sellSubsidiary(divId, blueprints),
  };
}
