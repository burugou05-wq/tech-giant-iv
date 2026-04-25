// @ts-check
import { CHASSIS_TECH, COMPONENT_TECH } from '../constants/index.js';
import { AI_COMPANIES } from '../constants/companies/index.js';
import { getTrendMultiplier } from '../utils/gameLogic.js';

/**
 * AI製品のシミュレーション
 * @param {any} nextAiProducts - 現在のAI製品リスト
 * @param {number} calcYear - 現在の年
 * @param {string} dateStr - 日付文字列（ログ用）
 * @param {any[]} newLogs - 新しいログの配列
 * @param {any} nextMarkets - 市場データ
 * @param {any} aiFinances - AI財務データ
 */
export function simulateAI(nextAiProducts, calcYear, dateStr, newLogs, nextMarkets, aiFinances) {
  // 全市場のシェアから実質的な売上ボリューム（順位）を推測する
  const volumeMap = { player: 0 };
  Object.keys(AI_COMPANIES).forEach(id => volumeMap[id] = 0);
  
  Object.values(nextMarkets).forEach(m => {
    if (m.locked) return;
    Object.keys(m.shares).forEach(cId => {
      volumeMap[cId] = (volumeMap[cId] || 0) + (m.shares[cId] * m.demand);
    });
  });

  // ボリューム順にソート
  const sortedCompanies = Object.keys(volumeMap).sort((a, b) => volumeMap[b] - volumeMap[a]);
  const playerRank = sortedCompanies.indexOf('player') + 1;
  const isPlayerTop = playerRank === 1;
  const aiRanking = sortedCompanies.filter(c => c !== 'player'); // AIのみの順位

  Object.entries(AI_COMPANIES).forEach(([aiId, ai]) => {
    const aiFin = aiFinances?.[aiId];
    if (aiFin?.isBankrupt) return;

    // 競合他社は活動期間中のみ新製品を出す
    if (calcYear < ai.appearsYear || calcYear > (ai.disappearsYear || Infinity)) return;

    // 現在の「時代 (Era)」の判定
    const eras = /** @type {any} */(ai).eras;
    const currentEra = Array.isArray(eras) ? eras.find(e => calcYear >= e.start && calcYear <= e.end) : null;
    const isEraStart = currentEra && currentEra.start === calcYear;

    // 時代開始時のログは削除 (ユーザー要望)

    // 前回の製品データを取得
    const prevProduct = nextAiProducts[aiId] || { appeal: 10, price: 100, name: `${ai.name} Classic`, launchYear: calcYear };
    const prevName = prevProduct.name || prevProduct.productName || '';
    
    // 傑作機（歴史的製品）の判定
    const history = /** @type {any} */(ai).history;
    const activeMasterpiece = Array.isArray(history) ? history.find(h => calcYear >= h.year && calcYear <= h.year + (/** @type {any} */ (h).duration || 5)) : null;
    
    // 傑作機の年になった最初の1回だけログを出し、フラグを立てる
    const isMasterpieceYear = activeMasterpiece && activeMasterpiece.year === calcYear;
    const isNewMasterpiece = isMasterpieceYear && !aiFin.launchedMasterpieceYear;
    if (isNewMasterpiece) {
      aiFin.launchedMasterpieceYear = calcYear; // 今年は既にログを出した
    }

    // 更新判定
    let currentUpdateChance = ai.updateChance;
    
    const playerShareInStrongMarket = nextMarkets[ai.strongMarket]?.shares?.player || 0;
    
    // 性格と状況の判定
    const myAiRank = aiRanking.indexOf(aiId) + 1; // 1位〜
    let isDesperate = false;
    let isCopycat = false;

    // プレイヤーが首位で、このAIがトップ3（旧覇者）なら「王座奪還モード」
    if (isPlayerTop && myAiRank <= 3) isDesperate = true;
    // または、得意市場を荒らされている場合は「地元防衛モード」
    if (playerShareInStrongMarket > 0.3) isDesperate = true;
    // プレイヤーが首位で、このAIが下位（4位以下）なら「模倣モード」
    if (isPlayerTop && myAiRank > 3) isCopycat = true;

    // 更新頻度へのバフ
    if (isDesperate) currentUpdateChance *= 3.0; // 必死に新製品を出す
    else if (isCopycat) currentUpdateChance *= 1.5;
    else if (playerShareInStrongMarket > 0.15) {
      currentUpdateChance *= (1.0 + playerShareInStrongMarket * 2);
    }

    if (activeMasterpiece) currentUpdateChance *= 3;
    if (currentEra?.type === 'golden') currentUpdateChance *= 1.5;
    
    const hasNoProduct = !nextAiProducts[aiId];
    if (Math.random() > currentUpdateChance && !isNewMasterpiece && !hasNoProduct && !isDesperate) return;

    // 最新技術の選定 (自分の主要市場のカテゴリーに合わせる)
    const targetCategory = nextMarkets[ai.strongMarket]?.category || 'home_appliance';
    let avail = CHASSIS_TECH.filter(c => c.era <= calcYear && c.category === targetCategory);
    
    // カテゴリーに合う技術がない場合は、全カテゴリーから最新を選ぶ
    if (avail.length === 0) {
      avail = CHASSIS_TECH.filter(c => c.era <= calcYear);
    }
    
    if (avail.length === 0) return;
    const bestChassis = avail.reduce((b, c) => (c.era >= b.era ? c : b), avail[0]);
    const availMods = COMPONENT_TECH.filter(m => m.era <= calcYear);
    
    let compApp = 0;
    let compCost = bestChassis.baseCost;
    
    if (bestChassis?.slots) {
      bestChassis.slots.forEach(slotType => {
        const mods = availMods.filter(m => m.type === slotType);
        if (mods.length > 0) {
          let bestMod;
          if (ai.strategy === 'innovator') {
            bestMod = mods.reduce((b, m) => m.appeal > (b?.appeal || 0) ? m : b, mods[0]);
          } else {
            bestMod = mods.reduce((b, m) => (m.appeal / m.cost) > (b.appeal / b.cost) ? m : b, mods[0]);
          }
          if (bestMod) {
            compApp += bestMod.appeal;
            compCost += (bestMod.costVal || 0); // 研究費(cost)ではなく、製造原価(costVal)を使う
          }
        }
      });
    }

    // ターゲット利益率の決定
    let targetMargin = 1.4;
    if (ai.priceTarget === 'premium') targetMargin = 2.2;
    if (ai.priceTarget === 'budget')  targetMargin = 1.15;
    
    // ブランド補正（ブランド力が高いほど利益率を維持しようとする）
    const brandVal = ai.brand || 0.4;
    
    // 競合（プレイヤー）への対抗ロジック
    const playerShare = playerShareInStrongMarket;
    if (playerShare > 0.1) {
      if (ai.priceTarget === 'budget' || brandVal < 0.4) {
        // 非ブランド/格安メーカーは過激に下げるが、原価割れはさせない
        const reduction = Math.min(0.4, playerShare * 0.6); 
        targetMargin = Math.max(1.05, targetMargin * (1.0 - reduction));
      } else {
        // ブランドメーカーはブランドイメージを重視
        const reduction = Math.min(0.15, playerShare * 0.2);
        targetMargin = Math.max(1.1, targetMargin * (1.0 - reduction));
      }
    }
    
    // 各企業固有の下限（minMargin）を守る。ただし格安メーカーは原価を割る直前まで行く
    const marginFloor = 1.0 + (ai.minMargin || 0.1);
    let finalMargin = Math.max(marginFloor, targetMargin);

    // モードによる最終補正
    if (isDesperate) {
      finalMargin = 1.02; // 利益度外視の超攻撃的価格（原価+2%）
    } else if (isCopycat) {
      finalMargin = 1.10; // 模倣品として薄利多売
    }
    
    let finalPrice = compCost * finalMargin;
    let finalAppeal = (bestChassis.baseAppeal + compApp) * ai.appealMod * getTrendMultiplier(bestChassis, calcYear);

    if (isDesperate) finalAppeal *= 1.2; // クランチ（深夜残業）による一時的な品質向上
    if (isCopycat) finalAppeal *= 0.85;  // 模倣品のペナルティ（魅力度は劣る）

    // 時代・性格によるバフ
    if (ai.strategy === 'innovator') finalAppeal *= 1.25;
    if (ai.strategy === 'cost_leader') finalPrice *= 0.9;
    if (currentEra) finalAppeal *= currentEra.buff;

    // 歴史的製品補正
    if (isNewMasterpiece && activeMasterpiece) {
      finalAppeal *= 2.5;
    } else if (activeMasterpiece) {
      finalAppeal *= 1.8;
    }

    // 提携・再生によるバフ
    if (aiFin?.parentId) {
      if (aiFin.maType === 'JV') finalAppeal *= 1.2; // 提携効果
      if (aiFin.maType === 'REHAB') finalAppeal *= 1.4; // 親会社からの強力な技術支援
    }

    // 製品名生成
    /** @type {Record<string, string[]>} */
    const SUFFIXES = {
      home_appliance: ['Cooker', 'Heater', 'Appliance', 'Home', 'Master'],
      audio:          ['Sound', 'Acoustic', 'Voice', 'Beat', 'Wave'],
      video:          ['Vision', 'Screen', 'Color', 'View', 'Tube'],
      game_console:   ['System', 'Entertainment', 'Console', 'Game', 'Master'],
      digital:        ['Digital', 'Player', 'Drive', 'Pod', 'Gear'],
      smart_device:   ['Phone', 'Smart', 'Pixel', 'Focus', 'Connect'],
    };
    const suffixes = SUFFIXES[bestChassis.category] || SUFFIXES.smart_device;
    let finalName = isNewMasterpiece ? activeMasterpiece.product : `${ai.prefixes[Math.floor(Math.random() * ai.prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    
    if (isCopycat) {
      finalName = `Clone ${suffixes[Math.floor(Math.random() * suffixes.length)]} by ${ai.name}`;
    } else if (activeMasterpiece && !isNewMasterpiece) {
      finalName = `${activeMasterpiece.product} ${calcYear - activeMasterpiece.year + 1}`;
    }

    if (isNewMasterpiece) {
      newLogs.push({ time: dateStr, msg: `【歴史的傑作】${ai.name}が伝説的製品「${finalName}」を世界発表！市場が震撼しています。`, type: 'warning' });
    } else if (isDesperate && Math.random() > 0.8) {
      // ログがうるさくならないよう20%の確率で表示
      newLogs.push({ time: dateStr, msg: `【王座奪還】業界上位の${ai.name}が、プレイヤー企業打倒のために利益度外視の戦略製品「${finalName}」を市場に投入しました！`, type: 'error' });
    } else if (isCopycat && Math.random() > 0.9) {
      newLogs.push({ time: dateStr, msg: `【模倣品警戒】シェアを奪われた${ai.name}が、生き残りのためプレイヤーを模倣した廉価製品「${finalName}」を展開しています。`, type: 'info', color: 'text-amber-400' });
    }

    // 再建モード時の特殊ロジック (ダンプ販売 ＆ ブランド低下)
    if (aiFin?.isRestructuring) {
      // ダンプ販売: 実際の原価(compCost)に対して5%の利益を乗せる
      finalPrice = Math.floor(compCost * 1.05);
      
      // ブランドの毀損: 低下速度を緩和
      ai.brand = Math.max(0.1, (ai.brand || 0.3) - 0.002);
      ai.appealMod = Math.max(0.7, (ai.appealMod || 1.0) - 0.002);
    }

    nextAiProducts[aiId] = {
      id: `${aiId}_${calcYear}`,
      companyId: aiId,
      name: finalName,
      appeal: finalAppeal,
      price: finalPrice,
      techLevel: bestChassis.era,
      category: bestChassis.category,
      launchYear: calcYear,
    };
  });
}
