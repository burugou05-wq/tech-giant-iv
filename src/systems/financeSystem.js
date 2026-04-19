/**
 * 財務システム: 固定費、利益確定、株価の更新
 */
export function updateFinanceSystem(
  money, profit, totalPlayerDemandShare, currentYear, totalFactories,
  nextMarkets, budget, loopEffects, instantMoneyGain, b2bRevenue
) {
  // 固定費の計算
  const orgOverheadCost = Object.keys(budget).reduce((sum, key) => {
    return sum + (budget[key] - 50) * 20;
  }, 0);
  
  const baseCost = ((totalFactories * 60) + (150 + (currentYear - 1946) * 15)) * loopEffects.factoryCostMulti;
  let currentFixedCost = Math.max(baseCost * 0.3, baseCost + orgOverheadCost);

  // マーケティング・店舗維持費
  let currentMarketingCost = 0;
  let currentStoreCost = 0;
  
  // フラグシップ製品があるかチェック
  const hasFlagship = nextMarkets && Object.values(nextMarkets).some(m => m.shares && m.shares.player > 0); 
  // 実際には生産ラインの情報が必要なので、呼び出し元から情報を渡すのが理想的ですが、
  // ここでは loopEffects や budget にフラグシップ情報を混ぜて渡す形に調整します。
  const flagshipMultiplier = loopEffects.hasFlagship ? 3.0 : 1.0;

  Object.keys(nextMarkets).forEach(k => {
    if (nextMarkets[k].locked) return;
    currentMarketingCost += nextMarkets[k].marketing * 150 * loopEffects.marketingMulti * flagshipMultiplier;
    currentStoreCost     += nextMarkets[k].stores    * 400;
  });

  const newStockPrice = (prevStockPrice) => {
    const safeProfit = Number.isFinite(profit) ? profit : 0;
    const safeShare = Number.isFinite(totalPlayerDemandShare) ? totalPlayerDemandShare : 0;
    const safePrev = Number.isFinite(prevStockPrice) ? prevStockPrice : 100;
    
    // 利益による変動 (利益 800k ごとに 1ドル変動)
    const profitImpact = safeProfit / 800;
    // シェアによる変動 (15%を基準とし、それを超えればプラス、下回ればマイナス)
    const shareImpact = (safeShare - 0.15) * 15;
    
    const nextPrice = safePrev + profitImpact + shareImpact;
    
    // 急激な変化を抑えるための微調整（前の値に引き寄せる）
    const smoothedPrice = safePrev * 0.9 + nextPrice * 0.1;

    return Math.max(10, Math.min(10000, Number.isFinite(smoothedPrice) ? smoothedPrice : safePrev));
  };

  return {
    currentFixedCost,
    currentMarketingCost,
    currentStoreCost,
    newStockPrice
  };
}
