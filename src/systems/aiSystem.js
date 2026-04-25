import { AI_COMPANIES } from '../constants/companies/index.js';

/** AI企業の財務初期化 */
export function ensureAiFinances(nextAiFinances) {
  Object.keys(AI_COMPANIES).forEach(id => {
    if (!nextAiFinances[id]) {
      const ai = AI_COMPANIES[id];
      nextAiFinances[id] = {
        money: ai.initialMoney || 100000,
        isBankrupt: false,
        activeMarkets: Object.keys(ai.regions || { jp: 0 }),
        factories: ai.initialFactories || Math.max(5, Math.floor((ai.initialMoney || 100000) / 15000)),
        operatingRate: 0.8
      };
    }
  });
}



/** JV/再生案件の維持・独立チェック */
export function processCompanyRelations(nextAiFinances, nextMarkets, dateStr, newLogs) {
  Object.keys(nextAiFinances).forEach(id => {
    const fin = nextAiFinances[id];
    if (fin.parentId && fin.maType === 'JV' && !fin.isBankrupt) {
      const parentId = fin.parentId;
      const parentFin = nextAiFinances[parentId];
      const targetDef = AI_COMPANIES[id];
      const buyerDef  = AI_COMPANIES[parentId];
      const marketKey = targetDef.strongMarket;
      const totalShare = (nextMarkets[marketKey]?.shares[id] || 0) + (nextMarkets[marketKey]?.shares[parentId] || 0);
      
      if (totalShare > 0.20) { 
         if (parentFin.money > fin.money * 2.5) {
            fin.maType = 'SUBSIDIARY';
            newLogs.push({ time: dateStr, msg: `【資本統合】合弁の成功を受け、${buyerDef.name}が${targetDef.name}を完全子会社化しました。`, type: 'warning' });
         } else if (Math.random() < 0.1) {
            fin.parentId = null;
            fin.maType = null;
            newLogs.push({ time: dateStr, msg: `【合弁解消】${buyerDef.name}と${targetDef.name}は、目的を達成したとして合弁を解消。再び独立した競合に戻ります。`, type: 'warning' });
         }
      }
      if (parentFin.isBankrupt) {
        fin.parentId = null;
        fin.maType = null;
      }
    }
    if (fin.parentId && fin.maType === 'REHAB' && !fin.isBankrupt) {
      const parentId = fin.parentId;
      const parentFin = nextAiFinances[parentId];
      const targetDef = AI_COMPANIES[id];
      const marketKey = targetDef.strongMarket;
      const subShare = nextMarkets[marketKey]?.shares[id] || 0;
      const parentShare = nextMarkets[marketKey]?.shares[parentId] || 0;
      
      if (subShare > parentShare && subShare > 0.05) {
         const severance = Math.floor(fin.money * 0.4 + 30000);
         if (fin.money > severance) {
            fin.money -= severance;
            if (parentFin) parentFin.money += severance;
            fin.parentId = null;
            fin.maType = null;
            newLogs.push({ time: dateStr, msg: `【独立・MBO】再建に成功した${targetDef.name}が${AI_COMPANIES[parentId].name}から独立！莫大な別れ金を支払い、再びライバルとなります。`, type: 'warning' });
         }
      }
    }
  });
}

/** AI企業の財務・価格戦略・倒産処理の更新 */
export function updateAiFinancials(context) {
  const { 
    nextAiFinances, nextAiProducts, nextMarkets, salesResults, 
    newTick, dateStr, newLogs 
  } = context;

  Object.entries(nextAiFinances).forEach(([id, aiFin]) => {
    const sales = salesResults.aiSales[id] || { units: 0, revenue: 0 };
    const aiProduct = nextAiProducts[id];
    const aiDef = AI_COMPANIES[id];
    
    if (aiProduct && aiFin && !aiFin.isBankrupt) {
      const revenue = sales.units * aiProduct.price;
      const varCost = sales.units * (aiProduct.baseCost || 70);
      const fixedCost = (aiFin.factories || 0) * 40 + 500;
      const tickProfit = revenue - varCost - fixedCost;

      const totalCapacity = Math.max(1, (aiFin.factories || 1) * 100);
      aiFin.operatingRate = sales.units / totalCapacity;
      let finalTickProfit = tickProfit;

      if (aiFin.isUnderBailout && finalTickProfit > 0) {
        const repayment = Math.floor(finalTickProfit * 0.3);
        finalTickProfit -= repayment;
        aiFin.bailoutTicks = (aiFin.bailoutTicks || 0) - 1;
        if (aiFin.bailoutTicks <= 0) {
          aiFin.isUnderBailout = false;
          newLogs.push({ time: dateStr, msg: `【完済】${aiDef.name}が公的資金を完済し、政府管理下から脱しました。`, type: 'info' });
        }
      }

      if (finalTickProfit > 10000 && aiFin.subsidyDebt > 0) {
        const repayment = Math.min(aiFin.subsidyDebt, Math.floor(finalTickProfit * 0.2));
        finalTickProfit -= repayment;
        aiFin.subsidyDebt -= repayment;
        if (aiFin.subsidyDebt <= 0) {
          newLogs.push({ time: dateStr, msg: `【完済】${aiDef.name}が雇用維持助成金をすべて完済しました。`, type: 'info' });
        }
      }

      if (aiFin.parentId && nextAiFinances[aiFin.parentId]) {
        nextAiFinances[aiFin.parentId].money += finalTickProfit;
        aiFin.money = Math.max(5000, aiFin.money); 
      } else {
        if (finalTickProfit < 2000) {
          const subsidyAmount = 2000 - finalTickProfit;
          aiFin.subsidyDebt = (aiFin.subsidyDebt || 0) + subsidyAmount;
          finalTickProfit = 2000;
        }
        aiFin.money += finalTickProfit;
      }
      
      if (!aiFin.isBankrupt && aiFin.money < -80000 && !aiFin.hasHadBailout) {
        aiFin.money = 200000; 
        aiFin.hasHadBailout = true;
        aiFin.isUnderBailout = true;
        aiFin.bailoutTicks = 130; 
        newLogs.push({ time: dateStr, msg: `【国家救済】政府は${aiDef.name}の破滅を回避するため、巨額の負債を肩代わりし、$200Mの公的資金を注入。国家的管理下で再出発します。`, type: 'warning', color: 'text-blue-400' });
      }
      
      const currentMargin = tickProfit / (Math.abs(revenue) || 1);
      const targetMargin = aiDef?.minMargin || 0.25;
      
      if (currentMargin < targetMargin) {
        aiProduct.price = Math.round(aiProduct.price * 1.02); 
      } else if (currentMargin > targetMargin + 0.2) {
        aiProduct.price = Math.round(aiProduct.price * 0.99); 
      }
      
      if (!aiFin.isBankrupt && aiFin.money < 5000 && !aiFin.isRestructuring) {
        const lastFinancing = aiFin.lastFinancingTick || 0;
        if (newTick - lastFinancing > 260) {
          const marketCap = (aiDef.stockBase || 100) * 1000;
          const injectAmount = Math.floor(marketCap * 0.2); 
          
          aiFin.money += injectAmount;
          aiFin.isRestructuring = true;
          aiFin.restructuringTicks = 78;
          aiFin.lastFinancingTick = newTick;
          aiFin.valuationPenalty = 0.7;
          
          newLogs.push({ time: dateStr, msg: `【経営再建】${aiDef.name}が第三者割当増資を実施し、$${(injectAmount/1000).toFixed(1)}Mを確保。再建屋CEOが就任し、過激なリストラを開始。`, type: 'warning', color: 'text-orange-400' });
        }
      }

      if (aiFin.isRestructuring) {
        aiFin.restructuringTicks = (aiFin.restructuringTicks || 0) - 1;
        if (aiFin.restructuringTicks <= 0) {
          aiFin.isRestructuring = false;
          aiFin.valuationPenalty = 1.0; 
          newLogs.push({ time: dateStr, msg: `【再建完了】${aiDef.name}の再建モードが終了しました。`, type: 'info' });
        }
      }

      if (aiFin.money < -100000) {
        aiFin.isBankrupt = true;
        newLogs.push({ time: dateStr, msg: `【倒産】${aiDef.name}が経営破綻し、市場から撤退しました。`, type: 'error', color: 'text-red-500' });
        
        Object.keys(nextMarkets).forEach(mKey => {
          const m = nextMarkets[mKey];
          if (m && m.shares) {
            if (m.shares[id]) m.shares[id] = 0;
          }
        });

        Object.values(nextAiFinances).forEach(f => {
          if (f.parentId === id) {
            f.parentId = null;
            f.money = Math.max(f.money, 10000); 
          }
        });
        
        newLogs.push({ time: dateStr, msg: `【独立】${aiDef.name}の破綻に伴い、傘下企業が独立を宣言。再び自立した経営に乗り出しました。`, type: 'info' });
      }
    }
  });
}
