import { AI_COMPANIES } from '../constants/companies/index.js';

/**
 * AI の経営判断（工場の増設・閉鎖）を実行
 * @param {Record<string, any>} nextAiFinances 
 * @param {number} ticks
 * @param {string} dateStr
 * @param {any[]} newLogs
 */
export function processAIBusinessLogic(nextAiFinances, ticks, dateStr, newLogs) {
  const currentYear = 1946 + Math.floor(ticks / 26);
  Object.entries(nextAiFinances).forEach(([id, aiFin]) => {
    if (aiFin.isBankrupt) return;

    const companies = /** @type {Record<string, any>} */ (AI_COMPANIES);
    const ai = companies[id];
    if (!ai) return;

    // その年において活動中の企業のみを対象にする
    if (currentYear < ai.appearsYear || currentYear > (ai.disappearsYear || Infinity)) return;

    // 1. 再建モード中の過激なリストラ (毎ターン判定)
    if (aiFin.isRestructuring) {
      if (aiFin.operatingRate < 0.6 && aiFin.factories > 1) {
        const drop = Math.max(1, Math.floor(aiFin.factories * 0.3));
        aiFin.factories -= drop;
        aiFin.money += drop * 5000; // 売却益
        newLogs.push({ time: dateStr, msg: `【リストラ】${ai.name}が再建のため工場を${drop}棟閉鎖しました。`, type: 'info' });
        return; 
      }
    }

    // 2. 通常の経営判断 (1年周期)
    if (ticks % 26 === 0) {
      const opRate = aiFin.operatingRate || 0;
      const expansionCost = 20000;

      // 増設判断
      if (opRate > 0.92 && aiFin.money > expansionCost * 2) {
        aiFin.factories = (aiFin.factories || 5) + 1;
        aiFin.money -= expansionCost;
        newLogs.push({ time: dateStr, msg: `【AI動向】${ai.name}が生産能力を増強（工場 ${aiFin.factories} 棟へ）`, type: 'info' });
      }
      // 削減判断
      else if ((opRate < 0.4 || aiFin.money < 5000) && aiFin.factories > 1) {
        aiFin.factories -= 1;
        aiFin.money += 5000;
        newLogs.push({ time: dateStr, msg: `【AI動向】${ai.name}が過剰設備を削減（工場 ${aiFin.factories} 棟へ）`, type: 'info' });
      }
    }
  });
}
