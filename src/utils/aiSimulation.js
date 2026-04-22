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
 * @param {any} nextMarkets - 市場データ
 * @param {any} aiFinances - AI財務データ
 */
export function simulateAI(nextAiProducts, calcYear, dateStr, newLogs, nextMarkets, aiFinances) {
  Object.entries(AI_COMPANIES).forEach(([aiId, ai]) => {
    const aiFin = aiFinances?.[aiId];
    if (aiFin?.isBankrupt) return;

    // 競合他社は活動期間中のみ新製品を出す
    if (calcYear < ai.appearsYear || calcYear > (ai.disappearsYear || Infinity)) return;

    // 現在の「時代 (Era)」の判定
    const currentEra = ai.eras?.find(e => calcYear >= e.start && calcYear <= e.end);
    const isEraStart = currentEra && currentEra.start === calcYear;

    // 時代開始時のログは削除 (ユーザー要望)

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
    
    const hasNoProduct = !nextAiProducts[aiId];
    if (Math.random() > currentUpdateChance && !isNewMasterpiece && !hasNoProduct) return;

    // 最新技術の選定 (自分の主要市場のカテゴリーに合わせる)
    const targetCategory = nextMarkets[ai.strongMarket]?.category || 'home_appliance';
    let avail = CHASSIS_TECH.filter(c => c.era <= calcYear && c.category === targetCategory);
    
    // カテゴリーに合う技術がない場合は、全カテゴリーから最新を選ぶ
    if (avail.length === 0) {
      avail = CHASSIS_TECH.filter(c => c.era <= calcYear);
    }
    
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
            compCost += (bestMod.costVal || 0); // 研究費(cost)ではなく、製造原価(costVal)を使う
          }
        }
      });
    }

    // ターゲット利益率の決定
    let targetMargin = 1.4;
    if (ai.priceTarget === 'premium') targetMargin = 2.2;
    if (ai.priceTarget === 'budget')  targetMargin = 1.15;
    
    // ブランド補正（ブランド力が高いほど利益率を維持しようとする）
    const brandVal = ai.brand || 0.4;
    
    // 競合（プレイヤー）への対抗ロジック
    const playerShare = playerShareInStrongMarket;
    if (playerShare > 0.1) {
      if (ai.priceTarget === 'budget' || brandVal < 0.4) {
        // 非ブランド/格安メーカーは過激に下げるが、原価割れはさせない
        const reduction = Math.min(0.4, playerShare * 0.6); 
        targetMargin = Math.max(1.05, targetMargin * (1.0 - reduction));
      } else {
        // ブランドメーカーはブランドイメージを重視
        const reduction = Math.min(0.15, playerShare * 0.2);
        targetMargin = Math.max(1.1, targetMargin * (1.0 - reduction));
      }
    }
    
    // 各企業固有の下限（minMargin）を守る。ただし格安メーカーは原価を割る直前まで行く
    const marginFloor = 1.0 + (ai.minMargin || 0.1);
    const finalMargin = Math.max(marginFloor, targetMargin);
    
    let finalPrice = compCost * finalMargin;
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

    // 提携・再生によるバフ
    if (aiFin?.parentId) {
      if (aiFin.maType === 'JV') finalAppeal *= 1.2; // 提携効果
      if (aiFin.maType === 'REHAB') finalAppeal *= 1.4; // 親会社からの強力な技術支援
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
    }

    // 再建モード時の特殊ロジック (ダンプ販売 ＆ ブランド低下)
    if (aiFin?.isRestructuring) {
      // ダンプ販売: 実際の原価(compCost)に対して5%の利益を乗せる
      finalPrice = Math.floor(compCost * 1.05);
      
      // ブランドの毀損: 低下速度を緩和
      ai.brand = Math.max(0.1, (ai.brand || 0.3) - 0.002);
      ai.appealMod = Math.max(0.7, (ai.appealMod || 1.0) - 0.002);
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
 * @param {any} aiFinances
 */
export function simulateMarketShares(nextMarkets, nextAiProducts, bestItem, calcYear, loopEffects, aiFinances) {
  let totalPlayerDemandShare = 0;

  Object.keys(nextMarkets).forEach(mKey => {
    const m = nextMarkets[mKey];
    const storeBuff = 1.0 + m.stores * 0.2;
    
    // 1. カテゴリー内の競合価格平均を算出 (その市場に進出している企業のみ)
    const competitorPrices = Object.entries(nextAiProducts)
      .filter(([id, p]) => {
        const companies = /** @type {Record<string, any>} */ (AI_COMPANIES);
        const ai = companies[id];
        if (!ai) return false;
        const active = calcYear >= ai.appearsYear && calcYear <= (ai.disappearsYear || Infinity);
        const r = /** @type {Record<string, number>} */ (ai.regions);
        const inRegion = r && r[mKey] && calcYear >= r[mKey];
        const matchCategory = p.category === m.category || (bestItem && p.category === bestItem.bp.category);
        return active && inRegion && matchCategory;
      })
      .map(([id, p]) => p.price);

    const avgMarketPrice = competitorPrices.length > 0 
      ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length 
      : 100;

    let playerEffectiveApp = 0;
    if (!m.locked && bestItem) {
      const safePrice = (bestItem.bp && Number.isFinite(bestItem.bp.price)) ? Math.max(1, bestItem.bp.price) : 100;
      const relativePrice = safePrice / avgMarketPrice;
      const priceFactor = Math.exp(-Math.pow(relativePrice - 0.8, 2) * 0.5); 
      
      const launchYear = bestItem.bp.launchYear || calcYear;
      const decay = Math.max(0.4, 1 - Math.max(0, calcYear - launchYear - 4) * 0.1);
      
      let finalApp = bestItem.app * (Number.isFinite(priceFactor) ? priceFactor : 1.0) * decay * storeBuff;
      
      // 目玉商品（Flagship）なら魅力度 1.5倍
      if (bestItem.strategy === 'flagship') {
        finalApp *= 1.5;
      }

      if (bestItem.bp.strategy === 'mainstream') {
        const prevShare = m.shares.player || 0;
        const momentumBuff = 1.0 + Math.min(0.2, (prevShare / 0.1) * 0.05);
        finalApp *= momentumBuff;
      }
      playerEffectiveApp = Number.isFinite(finalApp) ? finalApp : 0;
    }

    /** @type {Record<string, number>} */
    const rawAppeals = { player: playerEffectiveApp * (1.0 + m.marketing * 0.15) }; 

    Object.entries(AI_COMPANIES).forEach(([id, ai]) => {
      const active = calcYear >= ai.appearsYear && calcYear <= (ai.disappearsYear || Infinity);
      const r = /** @type {Record<string, number>} */ (ai.regions);
      const inRegion = r && r[mKey] && calcYear >= r[mKey];
      
      const aiFin = aiFinances[id];
      const aiProduct = nextAiProducts[id];
      let aiEffApp = 0;
      if (active && inRegion && aiProduct && !aiFin?.isBankrupt) {
        const decay = Math.max(0.4, 1 - Math.max(0, calcYear - aiProduct.launchYear - 4) * 0.1);
        const safeAiPrice = Number.isFinite(aiProduct.price) ? Math.max(1, aiProduct.price) : 100;
        const relativePrice = safeAiPrice / avgMarketPrice;
        
        let brandPower = ai.brand || 0.3;
        if (bestItem && bestItem.bp.strategy === 'budget') {
          brandPower = 0.8; 
        }
        
        const priceSensitivity = Math.max(0.1, 0.5 - brandPower * 0.4);
        const priceFactor = Math.exp(-Math.pow(relativePrice - 0.8, 2) * priceSensitivity);
        
        // 時代（黄金期・暗黒期）の判定
        const currentEra = ai.eras?.find(e => calcYear >= e.start && calcYear <= e.end);
        const eraBuff = currentEra ? currentEra.buff : 1.0;
        const appealMod = ai.appealMod || 1.0;
        
        aiEffApp = aiProduct.appeal * appealMod * eraBuff * (Number.isFinite(priceFactor) ? priceFactor : 1.0) * decay;
        if (ai.strongMarket === mKey) aiEffApp *= 1.15; 
      }
      rawAppeals[id] = Number.isFinite(aiEffApp) ? aiEffApp : 0;
    });

    // 2. 目標シェア（欲しい客の割合）を算出
    const exponent = 1.3; 
    /** @type {Record<string, number>} */
    const weightedAppeals = {};
    let totalWeighted = 0;
    Object.entries(rawAppeals).forEach(([id, app]) => {
      const weight = Math.pow(app, exponent);
      weightedAppeals[id] = weight;
      totalWeighted += weight;
    });
    totalWeighted = Math.max(0.01, totalWeighted);

    /** @type {Record<string, number>} */
    const targetShares = {};
    Object.keys(weightedAppeals).forEach(id => {
      targetShares[id] = weightedAppeals[id] / totalWeighted;
    });

    // 3. AI の生産能力制限を適用
    let unmetDemand = 0;
    /** @type {Record<string, number>} */
    const actualPotentialSales = {};
    
    Object.keys(AI_COMPANIES).forEach(id => {
      const potentialSalesUnits = targetShares[id] * m.demand;
      const finance = aiFinances ? aiFinances[id] : null;
      if (!finance) return;

      const maxWeeklyCapacity = (finance.factories || 5) * 40;
      const actualSales = Math.min(potentialSalesUnits, maxWeeklyCapacity);
      
      actualPotentialSales[id] = actualSales;
      unmetDemand += (potentialSalesUnits - actualSales);
      
      // 稼働率の更新（全市場の合計が必要だが、簡易的に市場ごとに加重平均的に計算）
      const currentRate = potentialSalesUnits > 0 ? actualSales / potentialSalesUnits : 1.0;
      finance.operatingRate = (finance.operatingRate * 0.8) + (Math.min(1.0, actualSales / Math.max(1, maxWeeklyCapacity)) * 0.2);
    });

    // 4. 溢れた需要（売り切れ分）をプレイヤーと他の供給余力があるメーカーに再分配
    const playerTargetShare = targetShares.player || 0;
    if (unmetDemand > 0 && playerTargetShare > 0) {
      // プレイヤーがどれだけ「買えなかった客」を受け入れられるか（簡易化のため魅力度比率で分配）
      const redistributionRatio = playerTargetShare / (1 - playerTargetShare);
      targetShares.player += (unmetDemand / m.demand) * Math.max(0.2, redistributionRatio);
    }

    // 5. 最終的なシェアの推移（徐々に変化）
    const shiftBase = 0.08; 
    const playerMarketingBonus = m.marketing * 0.05 * (loopEffects.marketingMulti || 1.0);
    
    // プレイヤーのシェア推移
    const pTarget = targetShares.player || 0;
    // ターゲットが0（製品なし）なら急速に失う(0.5)、あれば徐々に変化
    const pSpeed = pTarget === 0 ? 0.5 : (shiftBase + playerMarketingBonus);
    
    let finalPlayerShift = (pTarget - m.shares.player) * pSpeed;
    if (loopEffects.jpBonus && mKey === 'jp') finalPlayerShift *= 1.5;
    if (loopEffects.globalPenalty && mKey !== 'jp') finalPlayerShift -= 0.01;

    m.shares.player = Math.max(0, m.shares.player + finalPlayerShift);
    if (m.shares.player < 0.005) m.shares.player = 0;

    // AIのシェア推移
    Object.keys(AI_COMPANIES).forEach(cId => {
      const target = targetShares[cId] || 0;
      const current = m.shares[cId] || 0;
      // ターゲットが0なら急速に失う
      const speed = target === 0 ? 0.5 : shiftBase; 
      m.shares[cId] = Math.max(0, current + (target - current) * speed);
      if (m.shares[cId] < 0.005) m.shares[cId] = 0;
    });

    // 6. 合計を1に正規化 (すべてのキーを対象にする)
    const totalCurrentShare = Object.values(m.shares).reduce((a, b) => a + b, 0);
    if (totalCurrentShare > 0) {
      Object.keys(m.shares).forEach(k => {
        m.shares[k] /= totalCurrentShare;
      });
    }
    
    totalPlayerDemandShare += m.shares.player;
  });

  return totalPlayerDemandShare;
}

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
