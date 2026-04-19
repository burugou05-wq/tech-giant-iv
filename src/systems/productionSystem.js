import { CHASSIS_TECH } from '../constants/index.js';

/**
 * 生産システム: ラインの効率化、製品の製造、製造原価の計算
 */
export function updateProductionSystem(
  nextLines, nextInv, blueprints, qualityLevel, loopEffects, 
  nextActiveFocus, isSiloActive, isStrike
) {
  let currentVarCost = 0;
  let repairCostThisTick = 0;

  nextLines.forEach(line => {
    if (line.factories === 0 || line.strategy === 'discount') return;
    const bp = blueprints.find(b => b.id === line.blueprintId);
    if (!bp) return;

    // 習熟度（効率）の向上
    let effTarget = isSiloActive ? 70 : 100;
    if (nextActiveFocus?.id === 'fc_one_comp') effTarget = 40; // 統合中は効率が一時的に落ちる
    
    line.efficiency = Math.min(effTarget, line.efficiency + (effTarget - line.efficiency) * 0.05 * loopEffects.orgProductivity);
    if (line.efficiency > effTarget) line.efficiency -= 5;

    // 生産実行
    const prodMult = isStrike ? 0.3 : 1.0;
    const produced = Math.floor(line.factories * 40 * (line.efficiency / 100) * prodMult);
    
    if (!nextInv[bp.id]) nextInv[bp.id] = { amount: 0, sold: 0 };
    nextInv[bp.id].amount += produced;

    // 製造原価の計算
    const effectiveQuality = Number.isFinite(qualityLevel) ? Math.min(qualityLevel, loopEffects.qualityCap) : 80;
    const chassis = CHASSIS_TECH.find(c => c.id === bp.chassisId);
    const smartMult = (chassis?.category === 'smart_device') ? (loopEffects.smartphoneCostMulti || 1.0) : 1.0;
    const costMod = (effectiveQuality / 80) * (loopEffects.costMulti || 1.0) * smartMult;
    
    const baseCost = Number.isFinite(bp.cost) ? bp.cost : 50;
    const prodCost = produced * baseCost * costMod / (loopEffects.orgProductivity || 1.0);
    if (Number.isFinite(prodCost)) {
      currentVarCost += prodCost;
    }

    // 不良品・リコールコスト
    const defectRate = (100 - effectiveQuality) / 200;
    if (Math.random() < defectRate && produced > 0) {
      const repair = produced * baseCost * 1.5;
      if (Number.isFinite(repair)) repairCostThisTick += repair;
    }
  });

  return { currentVarCost, repairCostThisTick };
}
