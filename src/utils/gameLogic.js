import { CORPORATE_FOCUSES, CONTENT_INVESTMENTS, CHASSIS_TECH } from '../constants/index.js';

export const getCurrentEffects = (completed) => {
  const eff = {
    rpMulti: 1.0, costMulti: 1.0, marketingMulti: 1.0, synergyMulti: 1.0,
    propBonus: false, openB2B: false, openOverseas: false, smartphoneCostMulti: 1.0, appealMulti: 1.0,
    siloFix: false, factoryCostMulti: 1.0, jpBonus: false, globalPenalty: false,
    audioBuff: 1.0, qualityCap: 100,
  };
  completed.forEach(fid => {
    const f = CORPORATE_FOCUSES.find(x => x.id === fid);
    if (!f || !f.effects) return;
    if (f.effects.rpMulti)             eff.rpMulti             *= f.effects.rpMulti;
    if (f.effects.costMulti)           eff.costMulti           *= f.effects.costMulti;
    if (f.effects.marketingMulti)      eff.marketingMulti      *= f.effects.marketingMulti;
    if (f.effects.synergyMulti)        eff.synergyMulti        *= f.effects.synergyMulti;
    if (f.effects.propBonus)           eff.propBonus            = true;
    if (f.effects.openB2B)             eff.openB2B              = true;
    if (f.effects.openOverseas)         eff.openOverseas         = true;
    if (f.effects.smartphoneCostMulti) eff.smartphoneCostMulti *= f.effects.smartphoneCostMulti;
    if (f.effects.appealMulti)         eff.appealMulti         *= f.effects.appealMulti;
    if (f.effects.siloFix)             eff.siloFix              = true;
    if (f.effects.factoryCostMulti)    eff.factoryCostMulti    *= f.effects.factoryCostMulti;
    if (f.effects.jpBonus)             eff.jpBonus              = true;
    if (f.effects.globalPenalty)       eff.globalPenalty        = true;
    if (f.effects.audioBuff)           eff.audioBuff           *= f.effects.audioBuff;
    if (f.effects.qualityCap != null)  eff.qualityCap           = f.effects.qualityCap;
  });
  return eff;
};

export const getTrendMultiplier = (chassis, year) => {
  if (!chassis) return 1.0;
  const diff = year - chassis.peakYear;
  // ピーク年（絶頂期）より前であれば、最先端技術として 1.0倍（100%）を維持する
  if (diff < 0) return 1.0;
  // 減衰をマイルドに：0.15倍まで落ちるのを 0.4倍までに底上げし、減衰速度を半分にする
  return Math.max(0.4, 1.0 - diff * (chassis.decay || 0.05) * 0.5);
};

export const calculateEffectiveAppeal = (bp, year, ownedContentList, effects) => {
  if (!bp) return 0;
  const chassis = CHASSIS_TECH.find(c => c.id === bp.chassisId);
  if (!chassis) return 0;
  let app = (bp.baseAppeal || 0) * getTrendMultiplier(chassis, year) * effects.appealMulti;

  const launchYear = bp.launchYear || chassis.era;
  const age = Math.max(0, year - launchYear);
  let agePenalty = 1.0;
  // 劣化が始まるのを2年から4年に延長
  if (age > 4) {
    agePenalty -= Math.min(0.6, (age - 4) * 0.1);
  }
  // 世代遅れペナルティを 7% から 4% に軽減
  if (chassis.era < Math.max(...CHASSIS_TECH.filter(c => c.era <= year).map(c => c.era))) {
    agePenalty *= 0.96;
  }
  app *= Math.max(0.4, agePenalty);

  if (effects.audioBuff > 1.0 && chassis?.category === 'audio') app *= effects.audioBuff;
  let synergyMult = 1.0;
  ownedContentList.forEach(cId => {
    const inv = CONTENT_INVESTMENTS.find(c => c.id === cId);
    if (inv && (inv.target === chassis?.category || inv.target === 'video')) {
      synergyMult *= inv.appealBuff;
    }
  });
  app *= Math.min(synergyMult, 3.0) * effects.synergyMulti;

  // --- 戦略別バフの適用 ---
  if (bp.strategy === 'high-end') {
    // 原価の 2.5倍以上の価格設定なら 1.3倍のバフ
    const minPrice = bp.cost * 2.5;
    if (bp.price >= minPrice) {
      app *= 1.3;
    }
  } else if (bp.strategy === 'budget') {
    // 格安戦略は魅力度が 0.8倍に低下する
    app *= 0.8;
  }
  // MAINSTREAM のモメンタムバフは市場シェアに依存するため、シミュレーション側で適用

  return app;
};
