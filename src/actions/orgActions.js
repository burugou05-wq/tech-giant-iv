import { CORPORATE_FOCUSES } from '../constants/index.js';

/**
 * 組織・人事・経営方針関連のアクションを作成
 */
export const createOrgActions = (state, addLog) => {
  const { 
    money, setMoney, 
    leadershipPower, setLeadershipPower,
    setOrgStructure, 
    setDivisions, divisions,
    setBlueprints, setProductionLines, setInventory,
    setActiveFocus, setSelectedFocusDetails,
    setUnlockedTrees,
    markets,
    completedFocuses, activeFocus
  } = state;

  return {
    updateBudgetAllocation: (dept, newValue) => {
      setOrgStructure(prev => ({
        ...prev,
        budgetAllocation: {
          ...(prev.budgetAllocation || { rnd: 50, production: 50, marketing: 50, hr: 50 }),
          [dept]: Math.max(0, Math.min(100, newValue)),
        },
      }));
    },

    updateDivisionBudgetShare: (divKey, newValue) => {
      setDivisions(prev => {
        const next = structuredClone(prev);
        next[divKey].budgetShare = Math.max(0, newValue);
        const total = Object.values(next).reduce((sum, d) => sum + (d.active ? d.budgetShare : 0), 0);
        if (total > 0) {
          Object.keys(next).forEach(key => {
            if (next[key].active) next[key].budgetShare = (next[key].budgetShare / total) * 100;
          });
        }
        return next;
      });
    },

    executeInternalReform: () => {
      setOrgStructure(prev => {
        const next = structuredClone(prev);
        Object.values(next.departments).forEach(dept => {
          dept.morale = Math.min(100, dept.morale + 12);
          dept.coordination = Math.min(1.0, dept.coordination + 0.1);
        });
        next.siloRisk = Math.max(0, next.siloRisk - 15);
        return next;
      });
      addLog('内部組織改革で部門シナジーを改善しました。', 'info', 'text-cyan-300');
    },

    startCorporateFocus: (focusId) => {
      if (activeFocus) return; 
      const focus = CORPORATE_FOCUSES.find(f => f.id === focusId);
      if (!focus || completedFocuses.includes(focusId)) return;
      if (focus.excl?.some(e => completedFocuses.includes(e))) return;
      
      const reqSatisfied = !focus.req || focus.req.length === 0 || (
        focus.reqType === 'any'
          ? focus.req.some(r => completedFocuses.includes(r))
          : focus.req.every(r => completedFocuses.includes(r))
      );
      
      if (!reqSatisfied) return;
      
      setActiveFocus({ id: focusId, progress: 0 });
      setSelectedFocusDetails(null);
      
      if (focus.effects?.unlockTree) {
        const tree = focus.effects.unlockTree;
        setUnlockedTrees(prev => prev.includes(tree) ? prev : [...prev, tree]);
      }
    },

    spinOffDivision: (divId) => {
      const div = divisions[divId];
      const cost = 100000;
      const lpCost = 100;

      if (!div || div.isSubsidiary) return;
      if (div.level < 5) {
        addLog(`${div.name}のレベルが5以上である必要があります`, 'alert');
        return;
      }
      if (money < cost) {
        addLog('資金不足です（$100,000k必要）', 'alert');
        return;
      }
      if (leadershipPower < lpCost) {
        addLog('リーダーシップポイントが不足しています（100 LP必要）', 'alert');
        return;
      }

      setMoney(prev => prev - cost);
      setLeadershipPower(prev => prev - lpCost);
      setDivisions(prev => ({
        ...prev,
        [divId]: { ...prev[divId], isSubsidiary: true }
      }));
      addLog(`【子会社化】${div.name}を独立子会社化しました！`, 'info', 'text-indigo-300');
    },

    sellSubsidiary: (divId, blueprints) => {
      const div = divisions[divId];
      if (!div || !div.isSubsidiary) return;

      const orgValue = div.level * 50000;
      const totalShare = Object.values(markets).reduce((sum, m) => sum + (m.shares.player || 0), 0);
      const shareValue = (totalShare / 3) * 1000000;
      const finalPrice = Math.floor((orgValue + shareValue) * 1.5);

      if (!confirm(`${div.name}を$${finalPrice.toLocaleString()}kで売却しますか？`)) return;

      setMoney(prev => prev + finalPrice);
      setBlueprints(prev => prev.filter(bp => bp.category !== divId));
      setProductionLines(prev => prev.filter(line => {
        const bp = blueprints.find(b => b.id === line.blueprintId);
        return !bp || bp.category !== divId;
      }));
      
      setInventory(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(bpId => {
          const bp = blueprints.find(b => b.id === bpId);
          if (bp && bp.category === divId) delete next[bpId];
        });
        return next;
      });

      setDivisions(prev => ({
        ...prev,
        [divId]: { 
          ...prev[divId], 
          active: false, level: 1, xp: 0, isSubsidiary: false, budgetShare: 5
        }
      }));

      addLog(`【事業売却】${div.name}を売却しました。`, 'info', 'text-yellow-400');
    }
  };
};
