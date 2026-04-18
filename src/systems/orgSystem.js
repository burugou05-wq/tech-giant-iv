/**
 * 組織システム: サイロ化リスク、部門の効率・士気・連携の計算
 */
export function updateOrgSystem(nextOrgStructure, budget, loopEffects, calcYear, baseEffects, nextFlags, dateStr, newLogs) {
  const isSiloActive = calcYear >= 2000 && !baseEffects.siloFix;

  if (isSiloActive) {
    // 2000年以降、対策していないとサイロ化が進行
    nextOrgStructure.siloRisk = Math.min(100, Math.max(0, nextOrgStructure.siloRisk + 0.6 - (budget.hr / 83.3)));
    Object.keys(nextOrgStructure.departments).forEach(key => {
      const dept = nextOrgStructure.departments[key];
      dept.morale = Math.max(40, dept.morale - 0.2 - Math.random() * 0.3);
      dept.coordination = Math.max(0.4, dept.coordination - 0.003 - Math.random() * 0.004);
    });
    
    if (!nextFlags.siloNoticed && nextOrgStructure.siloRisk >= 30) {
      newLogs.push({ 
        time: dateStr, 
        msg: '組織のサイロ化が進み、部門連携が低下しています。人事への予算を増やしてください。', 
        type: 'alert', 
        color: 'text-red-400' 
      });
      nextFlags.siloNoticed = true;
    }
  } else if (baseEffects.siloFix) {
    // 対策（One Company方針など）済みならリスク低下
    nextOrgStructure.siloRisk = Math.max(0, nextOrgStructure.siloRisk - 1.5);
    Object.keys(nextOrgStructure.departments).forEach(key => {
      const dept = nextOrgStructure.departments[key];
      dept.morale = Math.min(100, dept.morale + 0.15);
      dept.coordination = Math.min(1.0, dept.coordination + 0.003);
    });
  } else {
    // 通常時の微増減
    const hrMult = budget.hr / 50;
    if (hrMult < 1) {
      nextOrgStructure.siloRisk = Math.min(100, nextOrgStructure.siloRisk + 0.1 * (1 - hrMult));
    } else {
      nextOrgStructure.siloRisk = Math.max(0, nextOrgStructure.siloRisk - 0.3 * hrMult);
    }
  }

  // 指標の再計算
  const depts = nextOrgStructure.departments;
  const avgEfficiency = (depts.rnd.efficiency + depts.production.efficiency + depts.marketing.efficiency + depts.hr.efficiency) / 4;
  const avgCoordination = (depts.rnd.coordination + depts.production.coordination + depts.marketing.coordination + depts.hr.coordination) / 4;
  const avgMorale = (depts.rnd.morale + depts.production.morale + depts.marketing.morale + depts.hr.morale) / 4;
  
  // 子会社の数によるボーナス
  const subsidiaryCount = Object.values(nextDivisions || {}).filter(d => d.isSubsidiary).length;
  const subsidiaryBonus = 1.0 + (subsidiaryCount * 0.05); // 1社につき5%生産性向上

  const riskFactor = 1.0 - Math.min(0.25, nextOrgStructure.siloRisk * 0.0025);
  const bMult = (key) => 0.5 + budget[key] / 100;

  return {
    orgProductivity: (0.8 + avgEfficiency * 0.2) * riskFactor * bMult('production') * subsidiaryBonus,
    orgInnovation: (0.8 + avgMorale * 0.002) * riskFactor * bMult('rnd') * (1.0 + subsidiaryCount * 0.02),
    orgCoordination: (0.75 + avgCoordination * 0.25) * riskFactor * bMult('marketing'),
    isSiloActive
  };
}
