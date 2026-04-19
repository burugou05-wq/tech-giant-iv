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

  return {
    appeal: finalAppeal,
    cost: finalCost,
    totalCostMulti,
    isSiloActive,
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

  // 2. 魅力度によるプレミアム（対数減衰）
  // 魅力度が上がるほど、1ポイントあたりの価格上乗せ効果を薄くする
  // 魅力度 50 を基準とし、log を使ってなだらかに上昇させる
  const appealBonus = appeal > 50 ? Math.log10(appeal / 50) * 0.8 : (appeal - 50) * 0.01;
  const appealFactor = 1 + appealBonus;
  
  // 3. おすすめ価格の決定
  // 基準価格を競合平均とし、魅力度係数を掛ける
  let recommended = Math.round(avgCompPrice * appealFactor);
  
  // ガード：あまりに暴利（利益率が極端）にならないように原価ベースでもチェック
  // 最大でも原価の3倍（利益率66%）、最低でも原価の1.2倍は確保する
  recommended = Math.max(cost * 1.2, Math.min(cost * 3.0, recommended));
  
  return {
    price: recommended,
    min: Math.round(avgCompPrice * 0.6),
    max: Math.round(avgCompPrice * 2.0),
    avg: Math.round(avgCompPrice)
  };
}
