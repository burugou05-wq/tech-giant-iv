import { AI_COMPANIES } from '../constants/index.js';

/**
 * 市場・販売関連のアクションを作成
 */
export const createMarketActions = (state, addLog) => {
  const { money, setMoney, setMarkets, markets, setProductionLines } = state;

  return {
    upgradeMarketing: (mKey) => {
      if (markets[mKey].locked) return;
      const cost = (markets[mKey].marketing + 1) * 1000;
      if (money < cost) {
        alert('資金不足');
        return;
      }
      setMoney(prev => prev - cost);
      setMarkets(p => ({ 
        ...p, 
        [mKey]: { ...p[mKey], marketing: p[mKey].marketing + 1 } 
      }));
    },

    buildDirectStore: (mKey, completedFocuses) => {
      if (!completedFocuses.includes('fc_direct_store')) return;
      if (markets[mKey].locked) return;
      const cost = 5000;
      if (money < cost) {
        alert('資金不足');
        return;
      }
      setMoney(prev => prev - cost);
      setMarkets(p => ({ 
        ...p, 
        [mKey]: { ...p[mKey], stores: p[mKey].stores + 1 } 
      }));
    },

    closeDirectStore: (mKey, completedFocuses) => {
      if (!completedFocuses.includes('fc_direct_store')) return;
      if (markets[mKey].stores <= 0) return;
      setMarkets(p => ({ 
        ...p, 
        [mKey]: { ...p[mKey], stores: p[mKey].stores - 1 } 
      }));
    },

    setLineStrategy: (lineId, strategy) => {
      setProductionLines(prev => prev.map(l => 
        l.id === lineId ? { ...l, strategy } : l
      ));
    },

    // ディシジョン用の大規模アクション
    executeMegaAd: () => {
      setMarkets(prev => {
        const nm = structuredClone(prev);
        Object.values(nm).forEach(m => {
          m.shares.player = Math.min(1.0, m.shares.player + 0.15);
        });
        return nm;
      });
      addLog('大規模広告キャンペーンを展開し、認知度を一気に高めました。', 'info', 'text-indigo-300');
    },

    executePriceWar: () => {
      setMarkets(prev => {
        const nm = structuredClone(prev);
        Object.values(nm).forEach(m => {
          m.shares.player = Math.min(1.0, m.shares.player + 0.1);
          Object.entries(AI_COMPANIES).forEach(([ai]) => {
            if (m.shares[ai] !== undefined) {
              m.shares[ai] = Math.max(0, m.shares[ai] - 0.033);
            }
          });
        });
        return nm;
      });
      addLog('価格攻勢を実施し、競合シェアを奪いました。', 'info', 'text-emerald-300');
    }
  };
};
