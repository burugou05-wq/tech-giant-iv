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
  if (diff < 0) return Math.min(1.0, 1.0 + diff * 0.05);
  return Math.max(0.15, 1.0 - diff * chassis.decay);
};

export const calculateEffectiveAppeal = (bp, year, ownedContentList, effects) => {
  if (!bp) return 0;
  const chassis = CHASSIS_TECH.find(c => c.id === bp.chassisId);
  if (!chassis) return 0;
  let app = (bp.baseAppeal || 0) * getTrendMultiplier(chassis, year) * effects.appealMulti;

  const launchYear = bp.launchYear || chassis.era;
  const age = Math.max(0, year - launchYear);
  let agePenalty = 1.0;
  if (age > 2) {
    agePenalty -= Math.min(0.75, (age - 2) * 0.12);
  }
  if (chassis.era < Math.max(...CHASSIS_TECH.filter(c => c.era <= year).map(c => c.era))) {
    agePenalty *= 0.93;
  }
  app *= Math.max(0.25, agePenalty);

  if (effects.audioBuff > 1.0 && chassis?.category === 'audio') app *= effects.audioBuff;
  let synergyMult = 1.0;
  ownedContentList.forEach(cId => {
    const inv = CONTENT_INVESTMENTS.find(c => c.id === cId);
    if (inv && (inv.target === chassis?.category || inv.target === 'video')) {
      synergyMult *= inv.appealBuff;
    }
  });
  app *= Math.min(synergyMult, 3.0) * effects.synergyMulti;
  return app;
};
