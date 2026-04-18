// @ts-check
import { AI_COMPANIES, CHASSIS_TECH, COMPONENT_TECH } from '../constants/index.js';
import { getTrendMultiplier } from '../utils/gameLogic.js';

/** @param {any} nextAiProducts @param {number} calcYear @param {string} dateStr @param {any[]} newLogs */
export function simulateAI(nextAiProducts, calcYear, dateStr, newLogs) {
  Object.entries(AI_COMPANIES).forEach(([aiId, ai]) => {
    // 競合他社は appearsYear から disappearsYear の間のみ活動する
    if (calcYear < ai.appearsYear || calcYear > (ai.disappearsYear || Infinity)) return;
    const prevProduct = nextAiProducts[aiId] || { appeal: 10, productName: `${ai.name} Classic`, launchYear: calcYear };
    const activeMasterpiece = ai.history?.find(h => calcYear >= h.year && calcYear <= h.year + (/** @type {any} */ (h).duration || 5));
    const isFirstLaunch = activeMasterpiece && activeMasterpiece.year === calcYear;
    const isNewMasterpiece = isFirstLaunch && !prevProduct.productName.startsWith(activeMasterpiece.product);

    const currentUpdateChance = activeMasterpiece ? ai.updateChance * 3 : ai.updateChance;
    if (Math.random() > currentUpdateChance && !isNewMasterpiece) return;

    const avail = CHASSIS_TECH.filter(c => c.era <= calcYear);
    if (avail.length === 0) return;
    const best = avail.reduce((b, c) => (c.era >= b.era ? c : b), avail[0]);
    const availMods = COMPONENT_TECH.filter(m => m.era <= calcYear);
    let compApp = 0;
    if (best?.slots) best.slots.forEach(slotType => {
      const mods = availMods.filter(m => m.type === slotType);
      if (mods.length > 0) {
        const bestMod = mods.reduce((b, m) => m.appeal > (b?.appeal || 0) ? m : b, mods[0]);
        if (bestMod) compApp += bestMod.appeal;
      }
    });

    /** @type {Record<string, string[]>} */
    const SUFFIXES = {
      home_appliance: ['Cooker', 'Heater', 'Appliance', 'Home', 'Master'],
      audio:          ['Sound', 'Acoustic', 'Voice', 'Beat', 'Wave'],
      video:          ['Vision', 'Screen', 'Color', 'View', 'Tube'],
      game_console:   ['Play', 'Station', 'Console', 'Game', 'Entertainment'],
      digital:        ['Digital', 'Player', 'Drive', 'Pod', 'Gear'],
      smart_device:   ['Vision', 'Sense', 'Pixel', 'Focus', 'Eye'],
    };
    const suffixes = SUFFIXES[best.category] || SUFFIXES.smart_device;
    let finalProductName = `${ai.prefixes[Math.floor(Math.random() * ai.prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    
    let finalAppeal = (best.baseAppeal + compApp) * ai.appealMod * getTrendMultiplier(best, calcYear);

    if (isNewMasterpiece && activeMasterpiece) {
      finalProductName = activeMasterpiece.product;
      finalAppeal *= 3.0; // 初代傑作機は通常の3倍の魅力度！
    } else if (activeMasterpiece) {
      const generation = calcYear - activeMasterpiece.year + 1;
      finalProductName = `${activeMasterpiece.product} Gen${generation}`;
      finalAppeal *= 2.5; // 黄金期中は後継機も強烈な魅力度を維持！
    } else {
      finalAppeal *= (0.8 + Math.random() * 0.4);
    }

    // --- 史実イベント：Monyショック (2003-2012) ---
    if (aiId === 'mony' && calcYear >= 2003 && calcYear <= 2012) {
      finalAppeal *= 0.6; // 魅力度40%ダウン
      if (calcYear === 2003 && Math.random() < 0.02) {
        newLogs.push({ 
          time: dateStr, 
          msg: `【衝撃】ライバルMonyが巨額赤字を発表。「Monyショック」によりブランド力が失墜しています。`, 
          type: 'alert' 
        });
      }
    }

    // --- 史実イベント：スマホショックによる伝統的メーカーの衰退 (2007-2015) ---
    const isTraditional = ['mony', 'natio', 'genera', 'hitac', 'motora'].includes(aiId);
    if (isTraditional && calcYear >= 2007 && calcYear <= 2015) {
      finalAppeal *= 0.7; // デジタル・スマホへの対応遅れ
    }

    const prevDecay = Math.max(0.4, 1 - Math.max(0, calcYear - (prevProduct.launchYear || calcYear) - 3) * 0.05);
    const currentPrevAppeal = prevProduct.appeal * prevDecay;

    if (isNewMasterpiece || activeMasterpiece || finalAppeal > currentPrevAppeal) {
      if (isNewMasterpiece) {
        newLogs.push({ time: dateStr, msg: `【歴史的傑作】${ai.name}が歴史に残る新製品「${finalProductName}」を発表し、市場を席巻！`, type: 'warning' });
      } else if (activeMasterpiece) {
        newLogs.push({ time: dateStr, msg: `【黄金期】${ai.name}が大ヒットシリーズの後継機「${finalProductName}」を発表！`, type: 'info' });
      } else {
        newLogs.push({ time: dateStr, msg: `${ai.name}が新製品「${finalProductName}」(${best.name}相当) を発表！`, type: 'info' });
      }
      nextAiProducts[aiId] = {
        ...prevProduct,
        appeal: finalAppeal,
        productName: finalProductName,
        launchYear: calcYear,
      };
    }
  });
}

/** @param {any} nextMarkets @param {any} nextAiProducts @param {any} bestItem @param {number} calcYear @param {any} loopEffects */
export function simulateMarketShares(nextMarkets, nextAiProducts, bestItem, calcYear, loopEffects) {
  let totalPlayerDemandShare = 0;

  Object.keys(nextMarkets).forEach(mKey => {
    const m = nextMarkets[mKey];
    const storeBuff = 1.0 + m.stores * 0.2;
    const pricePressure = bestItem
      ? Math.max(0.6, 1 - Math.max(0, calcYear - (bestItem.bp.launchYear || calcYear) - 3) * 0.05)
      : 1.0;
    const compApp = (!m.locked && bestItem) ? bestItem.app * pricePressure * storeBuff : 0;

    /** @type {Record<string, number>} */
    const appeals = { player: compApp };
    Object.entries(AI_COMPANIES).forEach(([id, ai]) => {
      const active = calcYear >= ai.appearsYear && calcYear <= (ai.disappearsYear || Infinity);
      const r = /** @type {Record<string, number>} */ (ai.regions);
      const inRegion = r && r[mKey] && calcYear >= r[mKey];
      const aiProduct = nextAiProducts[id];
      let aiApp = aiProduct?.appeal || 1;
      if (aiProduct?.launchYear) {
        const decay = Math.max(0.4, 1 - Math.max(0, calcYear - aiProduct.launchYear - 3) * 0.05);
        aiApp *= decay;
      }
      appeals[id] = (active && inRegion) ? aiApp : 0;
    });

    const totalAppeal = Object.values(appeals).reduce((sum, v) => sum + v, 0.01);
    let shareShift = (appeals.player / totalAppeal - m.shares.player)
      * (0.05 + m.marketing * 0.03 * loopEffects.marketingMulti) * loopEffects.orgCoordination;
    if (loopEffects.jpBonus     && mKey === 'jp') shareShift *= 2.0;
    if (loopEffects.globalPenalty && mKey !== 'jp') shareShift -= 0.02;

    m.shares.player = Math.max(0, Math.min(1.0, m.shares.player + shareShift));
    Object.entries(AI_COMPANIES).forEach(([c, ai]) => {
      const active = calcYear >= ai.appearsYear && calcYear <= (ai.disappearsYear || Infinity);
      const r = /** @type {Record<string, number>} */ (ai.regions);
      const inRegion = r && r[mKey] && calcYear >= r[mKey];
      if (!active || !inRegion) { m.shares[c] = 0; return; }
      const aiAppeal = ai.strongMarket === mKey ? appeals[c] * 1.08 : appeals[c];
      const currentShare = m.shares[c] || 0;
      m.shares[c] = Math.max(0, currentShare + (aiAppeal / totalAppeal - currentShare) * 0.05);
    });

    // normalise so shares sum to 1
    const totalShare = m.shares.player + Object.keys(AI_COMPANIES).reduce((s, c) => s + (m.shares[c] || 0), 0);
    if (totalShare > 0) {
      m.shares.player /= totalShare;
      Object.keys(AI_COMPANIES).forEach(c => { m.shares[c] = (m.shares[c] || 0) / totalShare; });
    }
    totalPlayerDemandShare += m.shares.player;
  });
  return totalPlayerDemandShare;
}
