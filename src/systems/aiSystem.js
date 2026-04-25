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

/** M&A結果の適用 */
export function applyMaDeals(deals, context) {
  const { nextAiFinances, nextMarkets, dateStr, newLogs, playerStats } = context;

  deals.forEach(deal => {
    const targetFin = nextAiFinances[deal.targetId];
    const buyerFin = deal.buyerId === 'player' ? null : nextAiFinances[deal.buyerId];
    const targetDef = AI_COMPANIES[deal.targetId];
    const buyerDef = deal.buyerId === 'player' ? { name: '自社' } : AI_COMPANIES[deal.buyerId];

    if (deal.type === 'SUBSIDIARY' && deal.buyerId === 'player') {
       playerStats.factories += targetFin.factories;
       playerStats.money -= 20000;
       targetFin.isBankrupt = true;
       newLogs.push({ time: dateStr, msg: `【買収完了】${targetDef.name}の全事業を買収し、技術と設備を統合しました。`, type: 'warning' });
    }
    else if (deal.type === 'SUBSIDIARY') {
      let ultimateParentId = deal.buyerId;
      while (nextAiFinances[ultimateParentId]?.parentId) {
        ultimateParentId = nextAiFinances[ultimateParentId].parentId;
      }
      const oldTargetId = deal.targetId;
      targetFin.parentId = ultimateParentId;
      targetFin.money = 5000;
      nextAiFinances[ultimateParentId].money -= 10000;
      Object.values(nextAiFinances).forEach(f => {
        if (f.parentId === oldTargetId) f.parentId = ultimateParentId;
      });
      newLogs.push({ time: dateStr, msg: `【グループ入り】${AI_COMPANIES[ultimateParentId].name}が${targetDef.name}を傘下に収めました。`, type: 'warning' });
    } 
    else if (deal.type === 'ABSORPTION') {
      const ultimateParentId = deal.buyerId; 
      const factoriesToTransfer = Math.max(1, Math.floor(targetFin.factories * 0.7));
      buyerFin.factories += factoriesToTransfer;
      if (targetFin.money > 0) buyerFin.money += targetFin.money;
      Object.keys(nextMarkets).forEach(mKey => {
        const m = nextMarkets[mKey];
        if (m.shares && m.shares[deal.targetId]) {
          m.shares[ultimateParentId] = (m.shares[ultimateParentId] || 0) + m.shares[deal.targetId];
          m.shares[deal.targetId] = 0;
        }
      });
      Object.values(nextAiFinances).forEach(f => {
        if (f.parentId === deal.targetId) f.parentId = ultimateParentId;
      });
      targetFin.isBankrupt = true;
      newLogs.push({ time: dateStr, msg: `【吸収合併】${buyerDef.name}が${targetDef.name}を完全に統合し、全市場シェアを継承しました。`, type: 'error' });
    }
    else if (deal.type === 'ABSORPTION' && deal.buyerId === 'player') {
      playerStats.factories += targetFin.factories;
      playerStats.money -= 15000;
      Object.keys(nextMarkets).forEach(mKey => {
        const m = nextMarkets[mKey];
        if (m.shares && m.shares[deal.targetId]) {
          m.shares.player = (m.shares.player || 0) + m.shares[deal.targetId];
          m.shares[deal.targetId] = 0;
        }
      });
      targetFin.isBankrupt = true;
      newLogs.push({ time: dateStr, msg: `【企業買収】経営難の${targetDef.name}を救済買収し、その販路と工場を統合しました。`, type: 'error' });
    }
    else if (deal.type === 'JV') {
      targetFin.parentId = deal.buyerId;
      targetFin.maType = 'JV';
      newLogs.push({ time: dateStr, msg: `【提携発表】${buyerDef.name}と${targetDef.name}が戦略的合弁を設立。市場での反撃を開始します。`, type: 'warning' });
    }
    else if (deal.type === 'REHAB') {
      targetFin.parentId = deal.buyerId;
      targetFin.maType = 'REHAB';
      if (buyerFin) buyerFin.money -= 50000;
      targetFin.money += 50000;
      newLogs.push({ time: dateStr, msg: `【事業再生】シェアを失った${targetDef.name}が${buyerDef.name}の傘下に入り、再建を開始しました。`, type: 'warning' });
    }
    else if (deal.type === 'MERGER') {
      const isTargetSurvivor = deal.targetId < deal.buyerId;
      const survivorId = isTargetSurvivor ? deal.targetId : deal.buyerId;
      const absorbedId = isTargetSurvivor ? deal.buyerId : deal.targetId;
      const survivor = nextAiFinances[survivorId];
      const absorbed = nextAiFinances[absorbedId];
      const sDef = isTargetSurvivor ? targetDef : buyerDef;
      const aDef = isTargetSurvivor ? buyerDef : targetDef;
      survivor.factories += absorbed.factories;
      survivor.money += absorbed.money;
      Object.keys(nextMarkets).forEach(mKey => {
        const m = nextMarkets[mKey];
        if (m.shares && m.shares[absorbedId]) {
          m.shares[survivorId] = (m.shares[survivorId] || 0) + m.shares[absorbedId];
          m.shares[absorbedId] = 0;
        }
      });
      Object.values(nextAiFinances).forEach(f => {
        if (f.parentId === absorbedId) f.parentId = survivorId;
      });
      absorbed.isBankrupt = true;
      newLogs.push({ time: dateStr, msg: `【対等合併】${sDef.name}と${aDef.name}が合併。シェアを統合し、強力な新勢力が誕生しました。`, type: 'warning' });
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
