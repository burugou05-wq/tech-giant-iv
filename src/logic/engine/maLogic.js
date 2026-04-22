import { AI_COMPANIES } from '../../constants/index.js';

/**
 * AI 企業間の M&A (合併・買収) 交渉をシミュレートする
 * @param {Record<string, any>} aiFinances 
 * @param {Record<string, any>} aiProducts 
 * @param {number} currentYear 
 * @returns {any[]} 交渉成立したイベントのリスト
 */
export function negotiateMA(aiFinances, aiProducts, currentYear) {
  const deals = [];
  const companies = Object.entries(AI_COMPANIES);
  
  // 処理済みの企業を追跡
  const processed = new Set();

  for (const [targetId, targetDef] of companies) {
    if (processed.has(targetId)) continue;
    const targetFin = aiFinances[targetId];
    if (!targetFin || targetFin.isBankrupt || targetFin.parentId) continue;

    // その年において活動中の企業のみを対象にする
    if (currentYear < targetDef.appearsYear || currentYear > (targetDef.disappearsYear || Infinity)) continue;
    
    // --- 歴史的合併（Destiny）の優先処理 ---
    if (targetDef.mergerDestiny && Math.floor(currentYear) === targetDef.mergerDestiny.year) {
      const { partner, type } = targetDef.mergerDestiny;
      // パートナーが存在し、かつ破綻していない場合のみ実行
      if (aiFinances[partner] && !aiFinances[partner].isBankrupt) {
        deals.push({ targetId, buyerId: partner, type: type, score: 999 });
        processed.add(targetId);
        continue;
      }
    }

    // 経営難の判定 (現金 5000k 未満、または倒産寸前)
    const isDistressed = targetFin.money < 5000 || targetFin.money < -50000;
    if (!isDistressed) continue;

    // パートナー候補を探す
    let bestPartner = null;
    let bestScore = 0;
    let dealType = null;

    for (const [buyerId, buyerDef] of companies) {
      if (buyerId === targetId || processed.has(buyerId)) continue;
      const buyerFin = aiFinances[buyerId];
      if (!buyerFin || buyerFin.isBankrupt || buyerFin.parentId) continue;

      // その年において活動中の企業のみを対象にする
      if (currentYear < buyerDef.appearsYear || currentYear > (buyerDef.disappearsYear || Infinity)) continue;

      let score = 0;
      let currentType = null;

      // 買収側が「強者」か「同類（経営難）」か
      const isBuyerStrong = buyerFin.money > 80000;
      const isBuyerDistressed = buyerFin.money < 5000;

      if (isBuyerStrong) {
        // パターン1 or 2: 買収ロジック
        currentType = targetFin.isRestructuring ? 'ABSORPTION' : 'SUBSIDIARY';
        
        // スコア計算
        score += 20; // 基本買収意欲
        if (!targetFin.isRestructuring) score += 20; // ブランドが生きているならプラス
        
        // 地域補完性
        if (targetDef.strongMarket !== buyerDef.strongMarket) score += 15;
        
        // カテゴリ補完性
        const targetCat = aiProducts[targetId]?.category;
        const buyerCat = aiProducts[buyerId]?.category;
        if (targetCat && buyerCat && targetCat !== buyerCat) score += 15;

        // ターゲットの切迫度
        if (targetFin.money < 0) score += 30;
      } 
      else if (isBuyerDistressed) {
        // パターン3: 対等合併
        currentType = 'MERGER';
        score += 10;
        if (targetDef.strongMarket === buyerDef.strongMarket) score += 20; // 同じ市場でシェアを合算したい
        if (targetFin.money < 0 && buyerFin.money < 0) score += 30; // お互い背に腹は代えられない
      }

      if (score > 60 && score > bestScore) {
        bestScore = score;
        bestPartner = buyerId;
        dealType = currentType;
      }
    }

    if (bestPartner && dealType) {
      deals.push({ targetId, buyerId: bestPartner, type: dealType, score: bestScore });
      processed.add(targetId);
      if (dealType === 'MERGER') processed.add(bestPartner);
    }
  }

  return deals;
}
