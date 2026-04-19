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
    moralePenalty: chassisDiv?.morale < 60
  };
};
