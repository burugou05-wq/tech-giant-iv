/**
 * 設計時のスペック計算ロジック
 */
export const calculateDesignSpecs = (params) => {
  const { 
    chassis, 
    designSlots, 
    allTech, 
    chassisDiv, 
    currentYear, 
    currentEffects 
  } = params;

  if (!chassis) return { appeal: 0, cost: 0, totalCostMulti: 1 };

  // ペナルティとボーナスの計算
  const isSiloActive = currentYear >= 2000 && !currentEffects?.siloFix;
  const moralePenalty = chassisDiv?.morale < 60 ? 1 + (60 - chassisDiv.morale) * 0.02 : 1;
  const siloPenalty = (isSiloActive && chassis.category === 'smart_device') ? 1.5 : 1;
  const totalCostMulti = (1 - (chassisDiv?.level || 1) * 0.01) * moralePenalty * siloPenalty;

  // 魅力度の計算
  let appeal = chassis.baseAppeal;
  chassis.slots.forEach(s => {
    const m = allTech.find(x => x.id === designSlots[s]);
    if (m) appeal += m.appeal;
  });
  const finalAppeal = Math.round(appeal * (1 + (chassisDiv?.level || 1) * 0.02));

  // 原価の計算
  let cost = chassis.baseCost;
  chassis.slots.forEach(s => {
    const m = allTech.find(x => x.id === designSlots[s]);
    if (m) cost += m.costVal;
  });
  const finalCost = Math.round(cost * totalCostMulti);

    moralePenalty: chassisDiv?.morale < 60,
    recommendation: calculateRecommendedPrice(finalAppeal, finalCost, chassis.category, params.aiProducts)
  };
};

/**
 * 推定相場とおすすめ価格の計算
 */
function calculateRecommendedPrice(appeal, cost, category, aiProducts) {
  if (!aiProducts) return { price: cost * 2.5, min: cost * 1.5, max: cost * 4 };

  // 1. カテゴリー内の競合価格を抽出
  const competitorPrices = Object.values(aiProducts)
    .filter(p => p.category === category)
    .map(p => p.price);
  
  const avgCompPrice = competitorPrices.length > 0 
    ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
    : cost * 2.5;

  // 2. 魅力度によるプレミアム/ディスカウント
  // 魅力度 50 を基準として、1ポイントにつき 1% の価格変動を許容
  const appealFactor = 1 + (appeal - 50) * 0.01;
  
  // 3. おすすめ価格の決定（原価率 30%〜40% を目安にしつつ競合に合わせる）
  const recommended = Math.round(Math.max(cost * 1.5, avgCompPrice * appealFactor));
  
  return {
    price: recommended,
    min: Math.round(avgCompPrice * 0.7),
    max: Math.round(avgCompPrice * 1.5),
    avg: Math.round(avgCompPrice)
  };
}
