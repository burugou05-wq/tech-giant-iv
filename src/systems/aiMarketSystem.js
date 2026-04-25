import { AI_COMPANIES } from '../constants/companies/index.js';

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
        const eras = /** @type {any} */(ai).eras;
        const currentEra = Array.isArray(eras) ? eras.find(e => calcYear >= e.start && calcYear <= e.end) : null;
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
    const shiftBase = 0.16; 
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
