import { AI_COMPANIES } from '../../constants/index.js';

/**
 * AI 企業間の M&A (合併・買収) 交渉をシミュレートする
 * @param {Record<string, any>} aiFinances 
 * @param {Record<string, any>} aiProducts 
 * @param {number} currentYear 
 * @param {Record<string, any>} markets
 * @returns {any[]} 交渉成立したイベントのリスト
 */
export function negotiateMA(aiFinances, aiProducts, currentYear, markets) {
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

    // --- 合弁会社 (JV) の検討 ---
    // シェアが低く、かつ独立している企業同士
    const targetStrongMarket = targetDef.strongMarket;
    const targetShare = markets[targetStrongMarket]?.shares[targetId] || 0;

    if (!isDistressed && targetShare < 0.10 && !targetFin.parentId && currentYear > 1990) {
       for (const [pId, pDef] of companies) {
         if (pId === targetId || processed.has(pId)) continue;
         const pFin = aiFinances[pId];
         if (!pFin || pFin.isBankrupt || pFin.parentId) continue;

         const pShare = markets[targetStrongMarket]?.shares[pId] || 0;
         if (pShare < 0.10 && pDef.strongMarket === targetStrongMarket) {
           // 戦略的提携 (JV)
           deals.push({ targetId, buyerId: pId, type: 'JV', score: 80 });
           processed.add(targetId);
           processed.add(pId);
           break;
         }
       }
       if (processed.has(targetId)) continue;
    }

    // --- 事業再生型・子会社化 (REHAB) の検討 ---
    // シェアが 0% の企業を巨大企業が拾い上げる
    if (targetShare <= 0 && !targetFin.parentId) {
       for (const [pId, pDef] of companies) {
         if (pId === targetId || processed.has(pId)) continue;
         const pFin = aiFinances[pId];
         // 親候補は潤沢な資金 (300,000k以上) を持っていること
         if (!pFin || pFin.isBankrupt || pFin.parentId || pFin.money < 300000) continue;

         // 再生案件として成立
         deals.push({ targetId, buyerId: pId, type: 'REHAB', score: 90 });
         processed.add(targetId);
         break;
       }
       if (processed.has(targetId)) continue;
    }

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
