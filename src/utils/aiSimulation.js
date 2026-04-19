// @ts-check
import { AI_COMPANIES, CHASSIS_TECH, COMPONENT_TECH } from '../constants/index.js';
import { getTrendMultiplier } from '../utils/gameLogic.js';

/**
 * AI製品のシミュレーション
 * @param {any} nextAiProducts - 現在のAI製品リスト
 * @param {number} calcYear - 現在の年
 * @param {string} dateStr - 日付文字列（ログ用）
 * @param {any[]} newLogs - 新しいログの配列
 */
export function simulateAI(nextAiProducts, calcYear, dateStr, newLogs) {
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
    if (activeMasterpiece) currentUpdateChance *= 3;
    if (currentEra?.type === 'golden') currentUpdateChance *= 1.5;
    
    if (Math.random() > currentUpdateChance && !isNewMasterpiece) return;

    // 最新技術の選定
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

    // 価格決定
    let margin = 1.4;
    if (ai.priceTarget === 'premium') margin = 2.2;
    if (ai.priceTarget === 'budget')  margin = 1.1;
    
    let finalPrice = compCost * margin;
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
    
    let playerEffectiveApp = 0;
    if (!m.locked && bestItem) {
      const safePrice = (bestItem.bp && Number.isFinite(bestItem.bp.price)) ? Math.max(1, bestItem.bp.price) : 100;
      const safeBaseCost = (bestItem.bp && Number.isFinite(bestItem.bp.baseCost)) ? bestItem.bp.baseCost : 50;
      
      const priceFactor = Math.pow(safeBaseCost * 2.0 / safePrice, 0.8);
      const launchYear = bestItem.bp.launchYear || calcYear;
      const decay = Math.max(0.5, 1 - Math.max(0, calcYear - launchYear - 3) * 0.08);
      
      const finalApp = bestItem.app * (Number.isFinite(priceFactor) ? priceFactor : 1.0) * decay * storeBuff;
      playerEffectiveApp = Number.isFinite(finalApp) ? finalApp : 0;
    }

    /** @type {Record<string, number>} */
    const appeals = { player: playerEffectiveApp };

    Object.entries(AI_COMPANIES).forEach(([id, ai]) => {
      const active = calcYear >= ai.appearsYear && calcYear <= (ai.disappearsYear || Infinity);
      const r = /** @type {Record<string, number>} */ (ai.regions);
      const inRegion = r && r[mKey] && calcYear >= r[mKey];
      
      const aiProduct = nextAiProducts[id];
      let aiEffApp = 0;
      if (active && inRegion && aiProduct) {
        const decay = Math.max(0.5, 1 - Math.max(0, calcYear - aiProduct.launchYear - 3) * 0.08);
        const safeAiPrice = Number.isFinite(aiProduct.price) ? Math.max(1, aiProduct.price) : 100;
        const safeAiApp = Number.isFinite(aiProduct.appeal) ? aiProduct.appeal : 1;
        
        const priceFactor = Math.pow(1.5 / (safeAiPrice / (safeAiApp / 10 + 1)), 0.5);
        aiEffApp = aiProduct.appeal * (Number.isFinite(priceFactor) ? priceFactor : 1.0) * decay;
        if (ai.strongMarket === mKey) aiEffApp *= 1.1;
      }
      appeals[id] = Number.isFinite(aiEffApp) ? aiEffApp : 0;
    });

    const totalAppeal = Object.values(appeals).reduce((sum, v) => sum + v, 0.01);
    
    let shareShift = (appeals.player / totalAppeal - m.shares.player)
      * (0.06 + m.marketing * 0.04 * loopEffects.marketingMulti) * loopEffects.orgCoordination;
    
    if (loopEffects.jpBonus && mKey === 'jp') shareShift *= 2.0;
    if (loopEffects.globalPenalty && mKey !== 'jp') shareShift -= 0.02;

    m.shares.player = Math.max(0, Math.min(1.0, m.shares.player + shareShift));
    
    if (Number.isFinite(m.shares.player)) {
      totalPlayerDemandShare += m.shares.player;
    }

    Object.entries(AI_COMPANIES).forEach(([c, ai]) => {
      const aiTargetShare = appeals[c] / totalAppeal;
      const currentShare = m.shares[c] || 0;
      m.shares[c] = Math.max(0, currentShare + (aiTargetShare - currentShare) * 0.06);
    });

    const totalShare = m.shares.player + Object.keys(AI_COMPANIES).reduce((s, c) => s + (m.shares[c] || 0), 0);
    if (totalShare > 0) {
      m.shares.player /= totalShare;
      Object.keys(AI_COMPANIES).forEach(c => { m.shares[c] = (m.shares[c] || 0) / totalShare; });
    }
    totalPlayerDemandShare += m.shares.player;
  });

  return totalPlayerDemandShare;
}
