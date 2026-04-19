import { AI_COMPANIES } from '../../constants/index.js';

/**
 * 企業の時価総額を計算
 */
export const calculateMarketCap = (id, stockPrice, currentYear, aiProducts, markets) => {
  if (id === 'player') {
    return stockPrice * 1000;
  }
  
  const ai = AI_COMPANIES[id];
  if (!ai) return 0;
  if (currentYear < ai.appearsYear || currentYear > (ai.disappearsYear || Infinity)) return 0;

  const base = ai.stockBase || 100;
  const appeal = aiProducts[id]?.appeal || 1;
  const yearFactor = 1 + Math.max(0, currentYear - ai.appearsYear) * 0.005;
  
  let totalShareEffect = 0;
  Object.entries(markets).forEach(([mKey, m]) => {
    const r = ai.regions;
    if (r && r[mKey] && currentYear >= r[mKey] && !m.locked) {
      totalShareEffect += (m.shares[id] || 0) * m.demand * 0.001;
    }
  });
  
  return Math.floor(base * (0.8 + appeal / 30) * yearFactor * (1 + totalShareEffect * 0.01) * 1000);
};

/**
 * 企業の推定売上を計算
 */
export const calculateRevenue = (id, money, currentYear, markets) => {
  if (id === 'player') {
    return money > 0 ? money : 0;
  }
  
  const ai = AI_COMPANIES[id];
  if (!ai) return 0;
  if (currentYear < ai.appearsYear || currentYear > (ai.disappearsYear || Infinity)) return 0;
  
  const base = ai.revenueBase || 50000;
  const totalShare = Object.values(markets).reduce((sum, m) => sum + (m.shares[id] || 0), 0);
  const years = Math.max(0, currentYear - 1946);
  
  return Math.floor(base * (0.5 + totalShare) * (1 + years * 0.008));
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
