// @ts-check
import { CORPORATE_FOCUSES, AI_COMPANIES } from '../constants/index.js';

/**
 * @param {ReturnType<typeof import('./useGameState.js').useGameState>} state 
 * @param {Function} addLog 
 * @param {number} currentYear 
 */
export function useGameActions(state, addLog, currentYear) {
  const {
    money, setMoney, leadershipPower, setLeadershipPower,
    setStockPrice, setEuExtraCost, setFlags, setMarkets, markets,
    setOrgStructure, completedFocuses, setBlueprints, blueprints, setInventory,
    setResearchPoints, setUnlockedTrees, activeFocus, setActiveFocus,
    setSelectedFocusDetails, setIsPaused, setActiveEvent, setYenRate,
    setDivisions, divisions, setProductionLines
  } = state;

  /** @param {any} dec */
  const executeDecision = (dec) => {
    if (leadershipPower < dec.lpCost || money < dec.moneyCost) return;
    setLeadershipPower(prev => prev - dec.lpCost);
    setMoney(prev => prev - dec.moneyCost);
    if (dec.action === 'buy_stock') setStockPrice(prev => prev * 1.2);
    if (dec.action === 'lobby_eu')  setEuExtraCost(0);
    if (dec.action === 'end_strike') setFlags(prev => ({ ...prev, isStrike: false }));
    if (dec.action === 'mega_ad') {
      setMarkets(prev => {
        const nm = structuredClone(prev);
        Object.values(nm).forEach(m => {
          m.shares.player = Math.min(1.0, m.shares.player + 0.15);
        });
        return nm;
      });
    }
    if (dec.action === 'internal_reform') {
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
    }
    if (dec.action === 'price_war') {
      setMarkets(prev => {
        const nm = structuredClone(prev);
        Object.values(nm).forEach(m => {
          m.shares.player = Math.min(1.0, m.shares.player + 0.1);
          Object.entries(AI_COMPANIES).forEach(([ai]) => {
            /** @type {Record<string, number>} */
            const shares = m.shares;
            if (shares[ai] !== undefined) shares[ai] = Math.max(0, shares[ai] - 0.033);
          });
        });
        return nm;
      });
      addLog('価格攻勢を実施し、競合シェアを奪いました。', 'info', 'text-emerald-300');
    }
    addLog('ディシジョン「' + dec.name + '」を実行。', 'info', 'text-indigo-400');
  };

  /** @param {'jp'|'na'|'eu'} mKey */
  const upgradeMarketing = (mKey) => {
    if (markets[mKey].locked) return;
    const cost = (markets[mKey].marketing + 1) * 1000;
    if (money < cost) { alert('資金不足'); return; }
    setMoney(prev => prev - cost);
    setMarkets(p => ({ ...p, [mKey]: { ...p[mKey], marketing: p[mKey].marketing + 1 } }));
  };

  /** @param {'jp'|'na'|'eu'} mKey */
  const buildDirectStore = (mKey) => {
    if (!completedFocuses.includes('fc_direct_store')) return;
    if (markets[mKey].locked) return;
    const cost = 5000;
    if (money < cost) { alert('資金不足'); return; }
    setMoney(prev => prev - cost);
    setMarkets(p => ({ ...p, [mKey]: { ...p[mKey], stores: p[mKey].stores + 1 } }));
  };

  /** @param {'jp'|'na'|'eu'} mKey */
  const closeDirectStore = (mKey) => {
    if (!completedFocuses.includes('fc_direct_store')) return;
    if (markets[mKey].stores <= 0) return;
    setMarkets(p => ({ ...p, [mKey]: { ...p[mKey], stores: p[mKey].stores - 1 } }));
  };

  /** @param {string} id */
  const deleteBlueprint = (id) => {
    setBlueprints(prev => prev.filter(b => b.id !== id));
  };

  /** 
   * @param {'rnd'|'production'|'marketing'|'hr'} dept 
   * @param {number} newValue 
   */
  const updateBudgetAllocation = (dept, newValue) => {
    setOrgStructure(prev => ({
      ...prev,
      budgetAllocation: {
        ...(prev.budgetAllocation || { rnd: 50, production: 50, marketing: 50, hr: 50 }),
        [dept]: Math.max(0, Math.min(100, newValue)),
      },
    }));
  };

  /** @param {import('../types.js').Category} divKey @param {number} newValue */
  const updateDivisionBudgetShare = (divKey, newValue) => {
    setDivisions(prev => {
      const next = structuredClone(prev);
      next[divKey].budgetShare = Math.max(0, newValue);
      const total = Object.values(next).reduce((sum, d) => sum + (d.active ? d.budgetShare : 0), 0);
      if (total > 0) {
        Object.keys(next).forEach(key => {
          const k = /** @type {keyof typeof next} */ (key);
          if (next[k].active) next[k].budgetShare = (next[k].budgetShare / total) * 100;
        });
      }
      return next;
    });
  };

  /** @param {string} bpId */
  const refreshBlueprint = (bpId) => {
    const template = blueprints.find(b => b.id === bpId);
    if (!template) return;
    const refreshCost = Math.max(8000, template.cost * 3);
    if (money < refreshCost) { alert('資金不足'); return; }
    setMoney(prev => prev - refreshCost);
    const newGen = (template.generation || 1) + 1;
    const baseName = template.name.replace(/ Mk\d+$/, '');
    const newName = `${baseName} Mk${newGen}`;
    setBlueprints(prev => [...prev, {
      ...template,
      id: `bp_${Date.now()}`,
      name: newName,
      launchYear: currentYear,
      generation: newGen,
    }]);
    addLog(`製品「${template.name}」の新世代バージョンを公開しました。`, 'info', 'text-cyan-300');
  };

  /** @param {string} action */
  const handleEventChoice = (action) => {
    switch (action) {
      case 'korean_war_money':
        setMoney(p => p + 8000);
        addLog('朝鮮戦争特需により大きな利益を得ました！', 'info', 'text-green-300');
        break;
      case 'tokyo_olympics_demand':
        setMoney(p => p - 2000);
        addLog('オリンピック特需に向けた先行投資を行いました。', 'info', 'text-cyan-300');
        break;
      case 'oil_shock_adapt':
        setMoney(p => p - 10000);
        setLeadershipPower(p => Math.max(0, p - 20));
        addLog('オイルショックのコスト高騰を緩和する体制を構築しました。', 'info', 'text-yellow-300');
        break;
      case 'plaza_overseas':
        setMoney(p => p - 15000);
        addLog('プラザ合意に対応するため海外生産を強化しました。', 'info', 'text-cyan-300');
        break;
      case 'plaza_quality':
        setResearchPoints(p => p + 3000);
        addLog('円高を乗り切るため高付加価値路線にシフトしました。', 'info', 'text-indigo-300');
        break;
      case 'dot_com_wait':
        addLog('ITバブル崩壊の嵐が過ぎるのを待ちます。', 'info', 'text-yellow-300');
        break;
      case 'lehman_cut_cost':
        setLeadershipPower(p => p + 50);
        addLog('リーマンショックの危機に対しコスト削減を断行しました。', 'info', 'text-yellow-300');
        break;
      case 'lehman_invest':
        setMoney(p => Math.max(0, p - 30000));
        setResearchPoints(p => p + 5000);
        addLog('リーマンショックの危機を好機と捉え、逆張り投資を行いました。', 'info', 'text-indigo-300');
        break;
      case 'unlock_bubble_tree':     setUnlockedTrees(p => [...p, 'bubble']);     break;
      case 'unlock_smartphone_tree': setUnlockedTrees(p => [...p, 'smartphone']); break;
      case 'start_strike':           setFlags(p => ({ ...p, isStrike: true }));   break;
      case 'macro_yen_high':         setYenRate(1.3);                             break;
      case 'macro_eu_cost':          setEuExtraCost(5);                           break;
      case 'fight_patent':
        setMoney(prev => prev - 12000);
        setLeadershipPower(prev => Math.max(0, prev - 30));
        addLog('法務戦略で特許紛争に対応しました。', 'alert', 'text-yellow-300');
        break;
      case 'settle_patent':
        setMoney(prev => prev - 18000);
        addLog('特許紛争を和解し、市場混乱を回避しました。', 'info', 'text-yellow-300');
        break;
    }
    setActiveEvent(null);
    setIsPaused(false);
  };

  /** @param {any} divId */
  const spinOffDivision = (divId) => {
    const div = /** @type {any} */(divisions)[divId];
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
      [divId]: { .../** @type {any} */(prev)[divId], isSubsidiary: true }
    }));
    addLog(`【子会社化】${div.name}を独立子会社化しました！組織の硬直化の影響を受けなくなります。`, 'info', 'text-indigo-300');
  };

  /** @param {any} divId */
  const sellSubsidiary = (divId) => {
    const div = /** @type {any} */(divisions)[divId];
    if (!div || !div.isSubsidiary) return;

    // --- 価格計算ロジック ---
    // 1. 組織価値 (Level * 50,000k)
    const orgValue = div.level * 50000;
    
    // 2. 市場シェア価値 (各地域のプレイヤーシェアの合計 * 500,000k)
    // 本来はカテゴリごとのシェアを出すべきですが、簡易化のため現在の全シェア合計をベースにします
    const totalShare = Object.values(markets).reduce((sum, m) => sum + (m.shares.player || 0), 0);
    const shareValue = (totalShare / 3) * 1000000; // 平均シェア率ベース

    // 3. 子会社プレミアム (1.5倍)
    const finalPrice = Math.floor((orgValue + shareValue) * 1.5);

    if (!confirm(`${div.name}を$${finalPrice.toLocaleString()}kで売却しますか？\n(このカテゴリの設計図と生産ラインはすべて消滅します)`)) return;

    // --- 実行処理 ---
    setMoney(prev => prev + finalPrice);
    
    // 設計図の削除 (その事業部のカテゴリに属するもの)
    setBlueprints(prev => prev.filter(bp => bp.category !== divId));
    
    // 生産ラインの削除 (削除した設計図を使っていたライン)
    setProductionLines(prev => prev.filter(line => {
      const bp = blueprints.find(b => b.id === line.blueprintId);
      return !bp || bp.category !== divId;
    }));

    // 在庫の削除
    setInventory((/** @type {any} */ prev) => {
      const next = { ...prev };
      Object.keys(next).forEach(bpId => {
        const bp = blueprints.find(b => b.id === bpId);
        if (bp && bp.category === divId) delete next[bpId];
      });
      return next;
    });

    // 事業部のリセット (非アクティブ化)
    setDivisions((/** @type {any} */ prev) => ({
      ...prev,
      [divId]: { 
        .../** @type {any} */(prev)[divId], 
        active: false, 
        level: 1, 
        xp: 0, 
        isSubsidiary: false,
        budgetShare: 5
      }
    }));

    addLog(`【事業売却】${div.name}を$${finalPrice.toLocaleString()}kで他社へ売却しました。`, 'info', 'text-yellow-400');
  };

  /** @param {string} focusId */
  const startCorporateFocus = (focusId) => {
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
  };

  /** @param {string} lineId @param {string} strategy */
  const setLineStrategy = (lineId, strategy) => {
    setProductionLines(prev => prev.map(l => 
      l.id === lineId ? { ...l, strategy } : l
    ));
  };

  return {
    executeDecision, upgradeMarketing, buildDirectStore, closeDirectStore,
    deleteBlueprint, updateBudgetAllocation, refreshBlueprint,
    handleEventChoice, startCorporateFocus, updateDivisionBudgetShare,
    setLineStrategy, spinOffDivision, sellSubsidiary
  };
}
