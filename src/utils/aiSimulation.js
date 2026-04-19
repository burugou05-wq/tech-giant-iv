// @ts-check
import { CHASSIS_TECH, COMPONENT_TECH } from '../constants/index.js';
import { AI_COMPANIES } from '../constants/companies/index.js';
import { getTrendMultiplier } from '../utils/gameLogic.js';

/**
 * AI製品のシミュレーション
 * @param {any} nextAiProducts - 現在のAI製品リスト
 * @param {number} calcYear - 現在の年
 * @param {string} dateStr - 日付文字列（ログ用）
 * @param {any[]} newLogs - 新しいログの配列
 */
export function simulateAI(nextAiProducts, calcYear, dateStr, newLogs, nextMarkets) {
  Object.entries(AI_COMPANIES).forEach(([aiId, ai]) => {
    // 競合他社は活動期間中のみ新製品を出す
    if (calcYear < ai.appearsYear || calcYear > (ai.disappearsYear || Infinity)) return;

    // 現在の「時代 (Era)」の判定
    const currentEra = ai.eras?.find(e => calcYear >= e.start && calcYear <= e.end);
    const isEraStart = currentEra && currentEra.start === calcYear;

    // 時代開始時のログ
    if (isEraStart) {
      const typeStr = currentEra.type === 'golden' ? '【黄金期】' : '【暗黒期】';
      const msg = `${typeStr}${ai.name}が「${currentEra.name}」に突入しました。${currentEra.desc}`;
      newLogs.push({ time: dateStr, msg, type: currentEra.type === 'golden' ? 'warning' : 'info' });
    }

    // 前回の製品データを取得
    const prevProduct = nextAiProducts[aiId] || { appeal: 10, price: 100, name: `${ai.name} Classic`, launchYear: calcYear };
    const prevName = prevProduct.name || prevProduct.productName || '';
    
    // 傑作機（歴史的製品）の判定
    const activeMasterpiece = ai.history?.find(h => calcYear >= h.year && calcYear <= h.year + (/** @type {any} */ (h).duration || 5));
    const isFirstLaunch = activeMasterpiece && activeMasterpiece.year === calcYear;
    const isNewMasterpiece = isFirstLaunch && !prevName.startsWith(activeMasterpiece.product);

    // 更新判定
    let currentUpdateChance = ai.updateChance;
    
    // プレイヤーが強い市場を持っている場合、AIは危機感を持って製品開発を急ぐ
    const playerShareInStrongMarket = nextMarkets[ai.strongMarket]?.shares?.player || 0;
    if (playerShareInStrongMarket > 0.3) {
      currentUpdateChance *= (1.0 + playerShareInStrongMarket * 2); // プレイヤーが強いほど開発頻度アップ
    }

    if (activeMasterpiece) currentUpdateChance *= 3;
    if (currentEra?.type === 'golden') currentUpdateChance *= 1.5;
    
    if (Math.random() > currentUpdateChance && !isNewMasterpiece) return;

    // 最新技術の選定
    // ... (既存の技術選定ロジック) ...
    const avail = CHASSIS_TECH.filter(c => c.era <= calcYear);
    if (avail.length === 0) return;
    const bestChassis = avail.reduce((b, c) => (c.era >= b.era ? c : b), avail[0]);
    const availMods = COMPONENT_TECH.filter(m => m.era <= calcYear);
    
    let compApp = 0;
    let compCost = bestChassis.baseCost;
    
    if (bestChassis?.slots) {
      bestChassis.slots.forEach(slotType => {
        const mods = availMods.filter(m => m.type === slotType);
        if (mods.length > 0) {
          let bestMod;
          if (ai.strategy === 'innovator') {
            bestMod = mods.reduce((b, m) => m.appeal > (b?.appeal || 0) ? m : b, mods[0]);
          } else {
            bestMod = mods.reduce((b, m) => (m.appeal / m.cost) > (b.appeal / b.cost) ? m : b, mods[0]);
          }
          if (bestMod) {
            compApp += bestMod.appeal;
            compCost += bestMod.cost;
          }
        }
      });
    }

    // 価格決定（対抗値下げロジック）
    let margin = 1.4;
    if (ai.priceTarget === 'premium') margin = 2.0;
    if (ai.priceTarget === 'budget')  margin = 1.1;

    // プレイヤーのシェアが高い市場では、利益を削って対抗値下げする
    if (playerShareInStrongMarket > 0.5) {
      margin *= 0.75; // 25%の利益削減で対抗
    } else if (playerShareInStrongMarket > 0.2) {
      margin *= 0.9;  // 10%の利益削減
    }
    
    let finalPrice = compCost * Math.max(0.8, margin); // 最低でも原価の80%（出血大サービス）まで
    let finalAppeal = (bestChassis.baseAppeal + compApp) * ai.appealMod * getTrendMultiplier(bestChassis, calcYear);

    // 時代・性格によるバフ
    if (ai.strategy === 'innovator') finalAppeal *= 1.25;
    if (ai.strategy === 'cost_leader') finalPrice *= 0.9;
    if (currentEra) finalAppeal *= currentEra.buff;

    // 歴史的製品補正
    if (isNewMasterpiece && activeMasterpiece) {
      finalAppeal *= 2.5;
    } else if (activeMasterpiece) {
      finalAppeal *= 1.8;
    }

    // 製品名生成
    /** @type {Record<string, string[]>} */
    const SUFFIXES = {
      home_appliance: ['Cooker', 'Heater', 'Appliance', 'Home', 'Master'],
      audio:          ['Sound', 'Acoustic', 'Voice', 'Beat', 'Wave'],
      video:          ['Vision', 'Screen', 'Color', 'View', 'Tube'],
      game_console:   ['System', 'Entertainment', 'Console', 'Game', 'Master'],
      digital:        ['Digital', 'Player', 'Drive', 'Pod', 'Gear'],
      smart_device:   ['Phone', 'Smart', 'Pixel', 'Focus', 'Connect'],
    };
    const suffixes = SUFFIXES[bestChassis.category] || SUFFIXES.smart_device;
    let finalName = isNewMasterpiece ? activeMasterpiece.product : `${ai.prefixes[Math.floor(Math.random() * ai.prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    if (activeMasterpiece && !isNewMasterpiece) {
        finalName = `${activeMasterpiece.product} ${calcYear - activeMasterpiece.year + 1}`;
    }

    if (isNewMasterpiece) {
      newLogs.push({ time: dateStr, msg: `【歴史的傑作】${ai.name}が伝説的製品「${finalName}」を世界発表！市場が震撼しています。`, type: 'warning' });
    } else if (finalAppeal > (prevProduct.appeal || 0) * 1.1) {
      newLogs.push({ time: dateStr, msg: `${ai.name}が最新技術を投入した新製品「${finalName}」を発売！($${Math.floor(finalPrice)})`, type: 'info' });
    }

    nextAiProducts[aiId] = {
      id: `${aiId}_${calcYear}`,
      companyId: aiId,
      name: finalName,
      appeal: finalAppeal,
      price: finalPrice,
      techLevel: bestChassis.era,
      category: bestChassis.category,
      launchYear: calcYear,
    };
  });
}

/**
 * 市場シェアのシミュレーション
 * @param {any} nextMarkets
 * @param {any} nextAiProducts
 * @param {any} bestItem
 * @param {number} calcYear
 * @param {any} loopEffects
 */
export function simulateMarketShares(nextMarkets, nextAiProducts, bestItem, calcYear, loopEffects) {
  let totalPlayerDemandShare = 0;

  Object.keys(nextMarkets).forEach(mKey => {
    const m = nextMarkets[mKey];
    const storeBuff = 1.0 + m.stores * 0.2;
    
    // 1. カテゴリー内の競合価格平均を算出（市場基準価格）
    const competitorPrices = Object.values(nextAiProducts)
      .filter(p => p.category === m.category || (bestItem && p.category === bestItem.bp.category))
      .map(p => p.price);
    const avgMarketPrice = competitorPrices.length > 0 
      ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length 
      : 100;

    let playerEffectiveApp = 0;
    if (!m.locked && bestItem) {
      const safePrice = (bestItem.bp && Number.isFinite(bestItem.bp.price)) ? Math.max(1, bestItem.bp.price) : 100;
      
      // 価格係数：市場平均と比較してペナルティを課す
      // 平均の2倍で魅力は半分以下、3倍でほぼゼロになるように指数関数的に減衰
      const relativePrice = safePrice / avgMarketPrice;
      const priceFactor = Math.exp(-Math.pow(relativePrice - 0.8, 2) * 0.5); // 0.8倍付近が最も効率が良い
      
      const launchYear = bestItem.bp.launchYear || calcYear;
      const decay = Math.max(0.5, 1 - Math.max(0, calcYear - launchYear - 3) * 0.08);
      
      const finalApp = bestItem.app * (Number.isFinite(priceFactor) ? priceFactor : 1.0) * decay * storeBuff;
      playerEffectiveApp = Number.isFinite(finalApp) ? finalApp : 0;
    }

    /** @type {Record<string, number>} */
    const rawAppeals = { player: playerEffectiveApp * (1.0 + m.marketing * 0.15) }; 

    Object.entries(AI_COMPANIES).forEach(([id, ai]) => {
      const active = calcYear >= ai.appearsYear && calcYear <= (ai.disappearsYear || Infinity);
      const r = /** @type {Record<string, number>} */ (ai.regions);
      const inRegion = r && r[mKey] && calcYear >= r[mKey];
      
      const aiProduct = nextAiProducts[id];
      let aiEffApp = 0;
      if (active && inRegion && aiProduct) {
        const decay = Math.max(0.5, 1 - Math.max(0, calcYear - aiProduct.launchYear - 3) * 0.08);
        const safeAiPrice = Number.isFinite(aiProduct.price) ? Math.max(1, aiProduct.price) : 100;
        
        const relativePrice = safeAiPrice / avgMarketPrice;
        const priceFactor = Math.exp(-Math.pow(relativePrice - 0.8, 2) * 0.5);
        
        aiEffApp = aiProduct.appeal * (Number.isFinite(priceFactor) ? priceFactor : 1.0) * decay;
        if (ai.strongMarket === mKey) aiEffApp *= 1.15; 
      }
      rawAppeals[id] = Number.isFinite(aiEffApp) ? aiEffApp : 0;
    });

    const exponent = 1.3; 
    const weightedAppeals = {};
    let totalWeighted = 0;
    Object.entries(rawAppeals).forEach(([id, app]) => {
      const weight = Math.pow(app, exponent);
      weightedAppeals[id] = weight;
      totalWeighted += weight;
    });
    totalWeighted = Math.max(0.01, totalWeighted);

    const targetShares = {};
    Object.keys(weightedAppeals).forEach(id => {
      targetShares[id] = weightedAppeals[id] / totalWeighted;
    });

    const shiftBase = 0.08; 
    const playerMarketingBonus = m.marketing * 0.05 * (loopEffects.marketingMulti || 1.0);
    const playerShareShift = (targetShares.player - m.shares.player) * (shiftBase + playerMarketingBonus);
    
    let finalPlayerShift = playerShareShift;
    if (loopEffects.jpBonus && mKey === 'jp') finalPlayerShift *= 1.5;
    if (loopEffects.globalPenalty && mKey !== 'jp') finalPlayerShift -= 0.01;

    m.shares.player = Math.max(0, Math.min(0.98, m.shares.player + finalPlayerShift));

    Object.keys(AI_COMPANIES).forEach(cId => {
      const target = targetShares[cId] || 0;
      const current = m.shares[cId] || 0;
      m.shares[cId] = Math.max(0, current + (target - current) * shiftBase);
    });

    const totalCurrentShare = m.shares.player + Object.keys(AI_COMPANIES).reduce((s, c) => s + (m.shares[c] || 0), 0);
    if (totalCurrentShare > 0) {
      m.shares.player /= totalCurrentShare;
      Object.keys(AI_COMPANIES).forEach(c => { 
        m.shares[c] = (m.shares[c] || 0) / totalCurrentShare; 
      });
    }
    
    totalPlayerDemandShare += m.shares.player;
  });

  return totalPlayerDemandShare;
}
