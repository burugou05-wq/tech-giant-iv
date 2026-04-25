import { useMemo } from 'react';
import { calculateEffectiveAppeal, getCurrentEffects } from '../utils/gameLogic.js';

export function useMarketData(markets, activeMarket, aiFinances, blueprints, currentYear, contentOwned, completedFocuses) {
  const effects = useMemo(() => getCurrentEffects(completedFocuses), [completedFocuses]);
  const activeMarketData = markets[activeMarket];

  const jvPairs = useMemo(() => {
    const pairs = {};
    if (!aiFinances) return pairs;
    Object.keys(aiFinances).forEach(id => {
      const f = aiFinances[id];
      if (f.parentId && f.maType === 'JV') {
        if (!pairs[f.parentId]) pairs[f.parentId] = [];
        pairs[f.parentId].push(id);
      }
    });
    return pairs;
  }, [aiFinances]);

  const playerBest = useMemo(() => {
    const sellable = blueprints
      .map(bp => ({ 
        bp, 
        app: calculateEffectiveAppeal(bp, currentYear, contentOwned, effects) 
      }))
      .sort((a, b) => b.app - a.app);
    return sellable[0] || null;
  }, [blueprints, currentYear, contentOwned, effects]);

  return { activeMarketData, jvPairs, playerBest, effects };
}
