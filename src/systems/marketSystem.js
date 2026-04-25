/**
 * 市場システム: 需要の変動、為替、販売処理、利益の集計
 */
export function updateMarketSystem(nextMarkets, preciseYear, calcYear, nextFlags, dateStr, newLogs, nextYenRate) {
  Object.keys(nextMarkets).forEach(k => {
    // ロックされていても需要の計算は継続する（AIが裏で活動するため）
    if (nextMarkets[k].locked) {
      if (k === 'cn' && preciseYear >= 1995) {
        nextMarkets[k].locked = false;
        newLogs.push({ 
          time: dateStr, 
          msg: '【市場開放】中国市場がアンロックされました！', 
          type: 'info', 
          color: 'text-emerald-400' 
        });
      }
    }
    
    let baseDemand = 1000;
    const yearsPassed = Number.isFinite(preciseYear) ? Math.max(0, preciseYear - 1946) : 0;
    
    // 市場ごとの基本需要曲線
    if (k === 'na')      baseDemand = 1500 + yearsPassed * 200 + Math.pow(yearsPassed, 1.65) * 4;
    else if (k === 'eu') baseDemand = 1200 + yearsPassed * 140 + Math.pow(yearsPassed, 1.55) * 2.5;
    else if (k === 'cn') {
      // 中国市場: 1995年から始まり、2000年代に爆発的に伸びる
      const cnYears = Math.max(0, preciseYear - 1995);
      baseDemand = 2000 + cnYears * 500 + Math.pow(cnYears, 2.8) * 0.5;
    }
    else if (k === 'jp') {
      baseDemand = 800 + yearsPassed * 70;
      // バブル景気
      if (preciseYear >= 1986 && preciseYear <= 1992) {
        if (!nextFlags.bubbleStarted) {
          newLogs.push({ time: dateStr, msg: '【好景気】日本市場でバブル到来！', type: 'info', color: 'text-yellow-400' });
          nextFlags.bubbleStarted = true;
        }
        baseDemand += Math.max(0, 1 - Math.abs(preciseYear - 1989) / 3) * 2500;
      } else if (preciseYear > 1992) {
        baseDemand = 2000 + (preciseYear - 1992) * 25;
      }
    }

    if (!Number.isFinite(baseDemand)) baseDemand = 1000;
    
    // 世界的な不況イベント
    if (calcYear >= 2000 && calcYear <= 2002 && k !== 'jp') baseDemand *= 0.7; // ITバブル崩壊
    if (calcYear >= 2008 && calcYear <= 2010) baseDemand *= 0.6;              // リーマンショック
    
    const currentDemand = Number.isFinite(nextMarkets[k].demand) ? nextMarkets[k].demand : 0;
    const calculatedDemand = Math.floor(
      currentDemand * 0.85 + (baseDemand * (0.92 + Math.random() * 0.16)) * 0.15
    );

    nextMarkets[k].demand = Number.isFinite(calculatedDemand) ? calculatedDemand : Math.floor(baseDemand);
  });
}

/**
 * 販売実行処理
 */
export function executeSales(nextMarkets, sellableProducts, nextInv, loopEffects, nextYenRate, euExtraCost) {
  let currentRevenue = 0;
  let currentVarCostAdd = 0;
  let currentLogisticsCost = 0;
  const aiSales = {};

  Object.keys(nextMarkets).forEach(mKey => {
    const m = nextMarkets[mKey];
    // 1. プレイヤーの販売 (市場がロックされている場合はスキップ)
    if (!m.locked) {
      let totalMarketDemand = Math.floor(m.demand * m.shares.player);
      let revMulti = loopEffects.propBonus ? (m.shares.player >= 0.5 ? 1.5 : 0.6) : 1.0;

    // 魅力度が高い順に在庫を売る
    for (const prod of sellableProducts) {
      if (totalMarketDemand <= 0) break;

      const invItem = nextInv[prod.bp.id];
      if (!invItem || invItem.amount <= 0) continue;

      let strategyAppealMult = 1.0;
      let strategyPriceMult  = 1.0;
      if (prod.strategy === 'flagship') {
        strategyAppealMult = 1.5;
      } else if (prod.strategy === 'discount') {
        strategyAppealMult = 2.0;
        strategyPriceMult  = 0.7;
      }

      const sold = Math.max(0, Math.min(invItem.amount, Math.floor(totalMarketDemand * strategyAppealMult)));
      if (sold > 0 && Number.isFinite(sold)) {
        invItem.amount -= sold;
        invItem.sold   += sold;
        totalMarketDemand -= Math.floor(sold / strategyAppealMult);

        const baseCost = Number.isFinite(prod.bp.cost) ? prod.bp.cost : 50;
        const sellPrice = Number.isFinite(prod.bp.price) ? prod.bp.price : baseCost * 2.5;
        let revenue = sold * sellPrice * revMulti * strategyPriceMult;
        
        // 輸送費の計算 (海外市場のみ: ドル建て)
        let logisticsCostPerUnitUsd = 0;
        if (mKey === 'na') logisticsCostPerUnitUsd = 4;
        if (mKey === 'eu') logisticsCostPerUnitUsd = 6;
        if (mKey === 'cn') logisticsCostPerUnitUsd = 3;

        if (mKey !== 'jp') {
          // 売上は円ベースのまま（為替による恩恵は、現地で安く見えて販売個数が爆発的に増えることで表現済）
          // ただし輸送費はドル建てのため、為替レートの影響を受ける
          const logisticsCost = sold * (logisticsCostPerUnitUsd * (nextYenRate / 100) + (mKey === 'eu' ? (euExtraCost || 0) : 0));
          if (Number.isFinite(logisticsCost)) {
            currentVarCostAdd += logisticsCost;
            currentLogisticsCost += logisticsCost;
          }
        }
        
        if (Number.isFinite(revenue)) {
          currentRevenue += revenue;
        }
      }
    }
  }

    // 2. AI 企業の販売集計（簡略化モデル：在庫無限として計算）
    Object.keys(m.shares).forEach(cId => {
      if (cId === 'player') return;
      const share = m.shares[cId] || 0;
      const soldUnits = Math.floor(m.demand * share);
      
      if (!aiSales[cId]) aiSales[cId] = { revenue: 0, units: 0 };
      
      // AI 製品の価格を取得（本来は aiProducts から引くべきだが、一旦簡略化）
      // ここでは aiProducts が渡されていないため、後で tickProcessor 側で補完するか引数を追加する
      aiSales[cId].units += soldUnits;
    });
  });

  return { currentRevenue, currentVarCostAdd, aiSales };
}
