import { CORPORATE_FOCUSES } from '../constants/index.js';

/** 重点方針(Focus)の進行 */
export function progressCorporateFocus(context, dateStr, newLogs) {
  const { nextActiveFocus, nextCompletedFocuses, nextUnlockedTrees, nextMarkets } = context;
  let instantEffectMoney = 0;

  // 【救済措置】方針が完了しているのに市場が閉じている場合の強制アンロック
  if (nextCompletedFocuses.includes('fc_global_entry')) {
    if (nextMarkets.na) nextMarkets.na.locked = false;
    if (nextMarkets.eu) nextMarkets.eu.locked = false;
  }

  if (nextActiveFocus) {
    nextActiveFocus.remainingTicks -= 1;
    if (nextActiveFocus.totalTicks > 0) {
      nextActiveFocus.progress = Math.floor(((nextActiveFocus.totalTicks - nextActiveFocus.remainingTicks) / nextActiveFocus.totalTicks) * 100);
    }
    
    if (nextActiveFocus.remainingTicks <= 0) {
      const focusId = nextActiveFocus.id;
      nextCompletedFocuses.push(focusId);
      
      const focusDef = CORPORATE_FOCUSES.find(f => f.id === focusId);
      if (focusDef?.effects) {
        if (focusDef.effects.unlockTree) {
          const tree = focusDef.effects.unlockTree;
          if (!nextUnlockedTrees.includes(tree)) {
            nextUnlockedTrees.push(tree);
          }
        }
        if (focusDef.effects.openOverseas) {
          if (nextMarkets.na) nextMarkets.na.locked = false;
          if (nextMarkets.eu) nextMarkets.eu.locked = false;
          newLogs.push({ time: dateStr, msg: `【海外展開】北米市場と欧州市場が解放されました！`, type: 'info', color: 'text-indigo-400' });
        }
        if (focusDef.effects.instantMoney) {
          instantEffectMoney += focusDef.effects.instantMoney;
        }
      }

      newLogs.push({ time: dateStr, msg: `【方針完了】「${nextActiveFocus.name}」が完了しました。`, type: 'success', color: 'text-cyan-400' });
      context.nextActiveFocus = null;
    }
  }
  return instantEffectMoney;
}
