import { AI_COMPANIES } from '../../constants/index.js';

/**
 * 企業の時価総額を計算
 */
export const calculateMarketCap = (id, stockPrice, currentYear, aiProducts, markets) => {
  // 安全装置: 全体の入力チェック
  const safeStockPrice = Number.isFinite(stockPrice) ? stockPrice : 100;
  const safeYear = Number.isFinite(currentYear) ? currentYear : 1946;

  if (id === 'player') {
    return safeStockPrice * 1000;
  }
  
  const ai = AI_COMPANIES[id];
  if (!ai) return 0;
  if (safeYear < ai.appearsYear || safeYear > (ai.disappearsYear || Infinity)) return 0;

  const base = ai.stockBase || 100;
  const aiProduct = aiProducts ? aiProducts[id] : null;
  const appeal = (aiProduct && Number.isFinite(aiProduct.appeal)) ? aiProduct.appeal : 1;
  const yearFactor = 1 + Math.max(0, safeYear - ai.appearsYear) * 0.005;
  
  let totalShareEffect = 0;
  if (markets) {
    Object.entries(markets).forEach(([mKey, m]) => {
      if (!m || m.locked) return;
      const r = ai.regions;
      if (r && r[mKey] && safeYear >= r[mKey]) {
        const share = (m.shares && Number.isFinite(m.shares[id])) ? m.shares[id] : 0;
        const demand = Number.isFinite(m.demand) ? m.demand : 0;
        totalShareEffect += share * demand * 0.001;
      }
    });
  }
  
  const finalCap = Math.floor(base * (0.8 + appeal / 30) * yearFactor * (1 + totalShareEffect * 0.01) * 1000);
  return Number.isFinite(finalCap) ? finalCap : 0;
};

/**
 * 企業の推定売上を計算
 */
export const calculateRevenue = (id, money, currentYear, markets) => {
  const safeMoney = Number.isFinite(money) ? money : 0;
  const safeYear = Number.isFinite(currentYear) ? currentYear : 1946;

  if (id === 'player') {
    return safeMoney > 0 ? safeMoney : 0;
  }
  
  const ai = AI_COMPANIES[id];
  if (!ai) return 0;
  if (safeYear < ai.appearsYear || safeYear > (ai.disappearsYear || Infinity)) return 0;
  
  const base = ai.revenueBase || 50000;
  const totalShare = markets ? Object.values(markets).reduce((sum, m) => {
    const s = (m && m.shares && Number.isFinite(m.shares[id])) ? m.shares[id] : 0;
    return sum + s;
  }, 0) : 0;
  
  const years = Math.max(0, safeYear - 1946);
  const finalRev = Math.floor(base * (0.5 + totalShare) * (1 + years * 0.008));
  
  return Number.isFinite(finalRev) ? finalRev : 0;
};

/**
 * 全企業のランキングデータを構築
 */
export const getRankedCompanies = (params) => {
  const { currentYear, stockPrice, aiProducts, markets, money } = params;
  
  const all = [
    { id: 'player', name: '自社 (TECH GIANT)', color: 'bg-green-500', textColor: 'text-green-400', isPlayer: true },
    ...Object.entries(AI_COMPANIES)
      .filter(([, ai]) => currentYear >= ai.appearsYear && currentYear <= (ai.disappearsYear || Infinity))
      .map(([id, ai]) => ({ id, name: ai.name, color: ai.color, textColor: ai.textColor, isPlayer: false })),
  ];

  return all
    .map(c => ({
      ...c,
      marketCap: calculateMarketCap(c.id, stockPrice, currentYear, aiProducts, markets),
      revenue: calculateRevenue(c.id, money, currentYear, markets),
    }))
    .sort((a, b) => b.marketCap - a.marketCap);
};
