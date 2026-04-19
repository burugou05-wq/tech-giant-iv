/**
 * 歴史イベント関連のアクションを作成
 */
export const createEventActions = (state, addLog) => {
  const { 
    setMoney, setLeadershipPower, setResearchPoints, 
    setUnlockedTrees, setFlags, setYenRate, setEuExtraCost,
    setActiveEvent, setIsPaused
  } = state;

  return {
    handleEventChoice: (action) => {
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
    }
  };
};
