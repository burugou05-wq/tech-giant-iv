import { AI_COMPANIES } from '../constants/companies/index.js';

/**
 * AI 企業間の M&A (合併・買収) 交渉をシミュレートする
 */
export function negotiateMA(aiFinances, aiProducts, currentYear, markets) {
  const deals = [];
  const companies = Object.entries(AI_COMPANIES);
  const processed = new Set();

  for (const [targetId, targetDef] of companies) {
    if (processed.has(targetId)) continue;
    const targetFin = aiFinances[targetId];
    if (!targetFin || targetFin.isBankrupt || targetFin.parentId) continue;

    if (currentYear < targetDef.appearsYear || currentYear > (targetDef.disappearsYear || Infinity)) continue;
    
    // --- 歴史的合併（Destiny）の優先処理 ---
    const destiny = targetDef.mergerDestiny;
    if (destiny && Math.floor(currentYear) === destiny.year) {
      const { partner, type } = destiny;
      if (aiFinances[partner] && !aiFinances[partner].isBankrupt) {
        deals.push({ targetId, buyerId: partner, type: type, score: 999 });
        processed.add(targetId);
        continue;
      }
    }

    const isDistressed = targetFin.money < 5000 || targetFin.money < -50000;
    const targetStrongMarket = targetDef.strongMarket;
    const targetShare = markets[targetStrongMarket]?.shares[targetId] || 0;

    // --- 合弁会社 (JV) の検討 ---
    if (!isDistressed && targetShare < 0.10 && !targetFin.parentId && currentYear > 1990) {
       for (const [pId, pDef] of companies) {
         if (pId === targetId || processed.has(pId)) continue;
         const pFin = aiFinances[pId];
         if (!pFin || pFin.isBankrupt || pFin.parentId) continue;

         const pShare = markets[targetStrongMarket]?.shares[pId] || 0;
         if (pShare < 0.10 && pDef.strongMarket === targetStrongMarket) {
           deals.push({ targetId, buyerId: pId, type: 'JV', score: 80 });
           processed.add(targetId);
           processed.add(pId);
           break;
         }
       }
       if (processed.has(targetId)) continue;
    }

    // --- 事業再生型・子会社化 (REHAB) の検討 ---
    if (targetShare <= 0 && !targetFin.parentId) {
       for (const [pId, pDef] of companies) {
         if (pId === targetId || processed.has(pId)) continue;
         const pFin = aiFinances[pId];
         if (!pFin || pFin.isBankrupt || pFin.parentId || pFin.money < 300000) continue;

         deals.push({ targetId, buyerId: pId, type: 'REHAB', score: 90 });
         processed.add(targetId);
         break;
       }
       if (processed.has(targetId)) continue;
    }

    if (!isDistressed) continue;

    let bestPartner = null;
    let bestScore = 0;
    let dealType = null;

    for (const [buyerId, buyerDef] of companies) {
      if (buyerId === targetId || processed.has(buyerId)) continue;
      const buyerFin = aiFinances[buyerId];
      if (!buyerFin || buyerFin.isBankrupt || buyerFin.parentId) continue;
      if (currentYear < buyerDef.appearsYear || currentYear > (buyerDef.disappearsYear || Infinity)) continue;

      let score = 0;
      let currentType = null;
      const isBuyerStrong = buyerFin.money > 80000;
      const isBuyerDistressed = buyerFin.money < 5000;

      if (isBuyerStrong) {
        currentType = targetFin.isRestructuring ? 'ABSORPTION' : 'SUBSIDIARY';
        score += 20; 
        if (!targetFin.isRestructuring) score += 20; 
        if (targetDef.strongMarket !== buyerDef.strongMarket) score += 15;
        const targetCat = aiProducts[targetId]?.category;
        const buyerCat = aiProducts[buyerId]?.category;
        if (targetCat && buyerCat && targetCat !== buyerCat) score += 15;
        if (targetFin.money < 0) score += 30;
      } 
      else if (isBuyerDistressed) {
        currentType = 'MERGER';
        score += 10;
        if (targetDef.strongMarket === buyerDef.strongMarket) score += 20; 
        if (targetFin.money < 0 && buyerFin.money < 0) score += 30; 
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

/** 
 * M&A結果の適用（副作用を持つ）
 */
export function applyMaDeals(deals, context) {
  const { nextAiFinances, nextMarkets, dateStr, newLogs, playerStats } = context;

  deals.forEach(deal => {
    const targetFin = nextAiFinances[deal.targetId];
    const buyerFin = deal.buyerId === 'player' ? null : nextAiFinances[deal.buyerId];
    const targetDef = AI_COMPANIES[deal.targetId];
    const buyerDef = deal.buyerId === 'player' ? { name: '自社' } : AI_COMPANIES[deal.buyerId];

    if (deal.type === 'SUBSIDIARY' && deal.buyerId === 'player') {
       playerStats.factories += targetFin.factories;
       playerStats.money -= 20000;
       targetFin.isBankrupt = true;
       newLogs.push({ time: dateStr, msg: `【買収完了】${targetDef.name}の全事業を買収し、技術と設備を統合しました。`, type: 'warning' });
    }
    else if (deal.type === 'SUBSIDIARY') {
      let ultimateParentId = deal.buyerId;
      while (nextAiFinances[ultimateParentId]?.parentId) {
        ultimateParentId = nextAiFinances[ultimateParentId].parentId;
      }
      const oldTargetId = deal.targetId;
      targetFin.parentId = ultimateParentId;
      targetFin.money = 5000;
      nextAiFinances[ultimateParentId].money -= 10000;
      Object.values(nextAiFinances).forEach(f => {
        if (f.parentId === oldTargetId) f.parentId = ultimateParentId;
      });
      newLogs.push({ time: dateStr, msg: `【グループ入り】${AI_COMPANIES[ultimateParentId].name}が${targetDef.name}を傘下に収めました。`, type: 'warning' });
    } 
    else if (deal.type === 'ABSORPTION') {
      const ultimateParentId = deal.buyerId; 
      const factoriesToTransfer = Math.max(1, Math.floor(targetFin.factories * 0.7));
      buyerFin.factories += factoriesToTransfer;
      if (targetFin.money > 0) buyerFin.money += targetFin.money;
      Object.keys(nextMarkets).forEach(mKey => {
        const m = nextMarkets[mKey];
        if (m.shares && m.shares[deal.targetId]) {
          m.shares[ultimateParentId] = (m.shares[ultimateParentId] || 0) + m.shares[deal.targetId];
          m.shares[deal.targetId] = 0;
        }
      });
      Object.values(nextAiFinances).forEach(f => {
        if (f.parentId === deal.targetId) f.parentId = ultimateParentId;
      });
      targetFin.isBankrupt = true;
      newLogs.push({ time: dateStr, msg: `【吸収合併】${buyerDef.name}が${targetDef.name}を完全に統合し、全市場シェアを継承しました。`, type: 'error' });
    }
    else if (deal.type === 'ABSORPTION' && deal.buyerId === 'player') {
      playerStats.factories += targetFin.factories;
      playerStats.money -= 15000;
      Object.keys(nextMarkets).forEach(mKey => {
        const m = nextMarkets[mKey];
        if (m.shares && m.shares[deal.targetId]) {
          m.shares.player = (m.shares.player || 0) + m.shares[deal.targetId];
          m.shares[deal.targetId] = 0;
        }
      });
      targetFin.isBankrupt = true;
      newLogs.push({ time: dateStr, msg: `【企業買収】経営難の${targetDef.name}を救済買収し、その販路と工場を統合しました。`, type: 'error' });
    }
    else if (deal.type === 'JV') {
      targetFin.parentId = deal.buyerId;
      targetFin.maType = 'JV';
      newLogs.push({ time: dateStr, msg: `【提携発表】${buyerDef.name}と${targetDef.name}が戦略的合弁を設立。市場での反撃を開始します。`, type: 'warning' });
    }
    else if (deal.type === 'REHAB') {
      targetFin.parentId = deal.buyerId;
      targetFin.maType = 'REHAB';
      if (buyerFin) buyerFin.money -= 50000;
      targetFin.money += 50000;
      newLogs.push({ time: dateStr, msg: `【事業再生】シェアを失った${targetDef.name}が${buyerDef.name}の傘下に入り、再建を開始しました。`, type: 'warning' });
    }
    else if (deal.type === 'MERGER') {
      const isTargetSurvivor = deal.targetId < deal.buyerId;
      const survivorId = isTargetSurvivor ? deal.targetId : deal.buyerId;
      const absorbedId = isTargetSurvivor ? deal.buyerId : deal.targetId;
      const survivor = nextAiFinances[survivorId];
      const absorbed = nextAiFinances[absorbedId];
      const sDef = isTargetSurvivor ? targetDef : buyerDef;
      const aDef = isTargetSurvivor ? buyerDef : targetDef;
      survivor.factories += absorbed.factories;
      survivor.money += absorbed.money;
      Object.keys(nextMarkets).forEach(mKey => {
        const m = nextMarkets[mKey];
        if (m.shares && m.shares[absorbedId]) {
          m.shares[survivorId] = (m.shares[survivorId] || 0) + m.shares[absorbedId];
          m.shares[absorbedId] = 0;
        }
      });
      Object.values(nextAiFinances).forEach(f => {
        if (f.parentId === absorbedId) f.parentId = survivorId;
      });
      absorbed.isBankrupt = true;
      newLogs.push({ time: dateStr, msg: `【対等合併】${sDef.name}と${aDef.name}が合併。シェアを統合し、強力な新勢力が誕生しました。`, type: 'warning' });
    }
  });
}

/** 
 * 1ターンのM&Aフロー全体を統括するサービス関数
 */
export function processMADeals(context) {
  const { nextAiFinances, nextAiProducts, calcYear, nextMarkets } = context;
  const deals = negotiateMA(nextAiFinances, nextAiProducts, calcYear, nextMarkets);
  if (deals.length > 0) {
    applyMaDeals(deals, context);
  }
}
