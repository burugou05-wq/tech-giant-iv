import { calculateEffectiveAppeal } from '../utils/gameLogic.js';

/** プレイヤーの販売可能製品リスト作成 */
export function preparePlayerProductList(blueprints, nextInv, nextLines, calcYear, loopEffects, contentOwned) {
  return blueprints.map(bp => {
    const app = calculateEffectiveAppeal(bp, calcYear, contentOwned, loopEffects);
    return {
      bp, 
      app: Number.isFinite(app) ? app : 0,
      stock: (nextInv[bp.id]?.amount || 0),
      isOnLine: nextLines.some(l => l.blueprintId === bp.id && l.factories > 0),
      strategy: nextLines.find(l => l.blueprintId === bp.id)?.strategy
    };
  }).filter(p => p.stock > 0 || p.isOnLine).sort((a, b) => b.app - a.app);
}

/** 事業部経験値とリソースの更新 */
export function updateDivisionExperience(divisions, lines, blueprints, calcYear, loopEffects, orgResults) {
  let rpGain = (15 + Math.floor((calcYear - 1946) / 3)) * loopEffects.rpMulti * orgResults.orgInnovation;
  if (orgResults.isSiloActive) rpGain *= 0.5;
  if (!Number.isFinite(rpGain)) rpGain = 0;

  Object.values(divisions).forEach(div => {
    if (!div.active) return;
    const divLines = lines.filter(l => l.factories > 0 && blueprints.find(b => b.id === l.blueprintId && b.category === div.id));
    div.xp += divLines.reduce((sum, l) => sum + l.factories, 0);
    if (div.xp > div.level * 500) { 
      div.xp -= div.level * 500; 
      div.level = Math.min(10, div.level + 1); 
    }
  });
  
  return rpGain;
}
