import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award } from 'lucide-react';
import { useGame } from '../../context/GameContext.jsx';
import { AI_COMPANIES } from '../../constants/index.js';

// ==========================================
// ランキングタブ
// ==========================================
export default function Ranking() {
  const { stockPrice, markets, aiProducts, currentYear, money } = useGame();

  // --- 時価総額の計算 ---
  const getMarketCap = (id) => {
    if (id === 'player') {
      return stockPrice * 1000; // 自社の時価総額
    }
    const ai = AI_COMPANIES[id];
    if (!ai) return 0;
    if (currentYear < ai.appearsYear || currentYear > (ai.disappearsYear || Infinity)) return 0;

    const base = ai.stockBase || 100;
    const appeal = aiProducts[id]?.appeal || 1;
    const yearFactor = 1 + Math.max(0, currentYear - ai.appearsYear) * 0.005;
    // 各市場のシェアからの売上効果
    let totalShareEffect = 0;
    Object.entries(markets).forEach(([mKey, m]) => {
      const r = /** @type {Record<string, number>} */ (ai.regions);
      if (r && r[mKey] && currentYear >= r[mKey] && !m.locked) {
        totalShareEffect += (m.shares[id] || 0) * m.demand * 0.001;
      }
    });
    return Math.floor(base * (0.8 + appeal / 30) * yearFactor * (1 + totalShareEffect * 0.01) * 1000);
  };

  const getRevenue = (id) => {
    if (id === 'player') {
      return money > 0 ? money : 0;
    }
    const ai = AI_COMPANIES[id];
    if (!ai) return 0;
    if (currentYear < ai.appearsYear || currentYear > (ai.disappearsYear || Infinity)) return 0;
    const base = ai.revenueBase || 50000;
    const totalShare = Object.values(markets).reduce((sum, m) => sum + (m.shares[id] || 0), 0);
    const years = Math.max(0, currentYear - 1946);
    return Math.floor(base * (0.5 + totalShare) * (1 + years * 0.008));
  };

  // --- ランキングリスト構築 ---
  const allCompanies = [
    { id: 'player', name: '自社 (TECH GIANT)', color: 'bg-green-500', textColor: 'text-green-400', isPlayer: true },
    ...Object.entries(AI_COMPANIES)
      .filter(([, ai]) => currentYear >= ai.appearsYear && currentYear <= (ai.disappearsYear || Infinity))
      .map(([id, ai]) => ({ id, name: ai.name, color: ai.color, textColor: ai.textColor, isPlayer: false })),
  ];

  const ranked = allCompanies
    .map(c => ({
      ...c,
      marketCap: getMarketCap(c.id),
      revenue: getRevenue(c.id),
    }))
    .sort((a, b) => b.marketCap - a.marketCap);

  const playerRank = ranked.findIndex(c => c.isPlayer) + 1;

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" />;
    if (rank === 2) return <Medal size={18} className="text-slate-300" />;
    if (rank === 3) return <Award size={18} className="text-amber-600" />;
    return <span className="text-slate-600 font-black text-sm w-5 text-center">{rank}</span>;
  };

  const getRankBg = (rank, isPlayer) => {
    if (isPlayer) return 'bg-green-900/30 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
    if (rank === 1) return 'bg-yellow-900/20 border-yellow-500/30';
    if (rank === 2) return 'bg-slate-800 border-slate-600/50';
    if (rank === 3) return 'bg-amber-900/10 border-amber-700/30';
    return 'bg-slate-800/60 border-slate-700/40';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-900/30 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Trophy size={28} className="text-yellow-400" />
              世界企業ランキング
            </h2>
            <p className="text-slate-400 text-xs mt-1">{currentYear}年 時価総額ランキング</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-bold">あなたの順位</div>
            <div className={`text-5xl font-black ${playerRank <= 3 ? 'text-yellow-400' : playerRank <= 5 ? 'text-indigo-400' : 'text-slate-400'}`}>
              {playerRank}<span className="text-lg text-slate-500">位</span>
            </div>
            <div className="text-[10px] text-slate-500">{ranked.length}社中</div>
          </div>
        </div>

        {/* プレイヤーが1位なら特別メッセージ */}
        {playerRank === 1 && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-xl flex items-center gap-3 animate-pulse">
            <Crown size={24} className="text-yellow-400" />
            <div>
              <div className="text-sm font-black text-yellow-400">🎉 世界一の企業！</div>
              <div className="text-[10px] text-yellow-200/70">あなたの会社は世界で最も価値のある企業です。</div>
            </div>
          </div>
        )}
      </div>

      {/* ランキングリスト */}
      <div className="space-y-2">
        {ranked.map((company, index) => {
          const rank = index + 1;
          return (
            <div key={company.id}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${getRankBg(rank, company.isPlayer)}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* 順位 */}
                <div className="w-8 flex justify-center shrink-0">
                  {getRankIcon(rank)}
                </div>

                {/* 企業名 */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${company.color}`} />
                  <div className="min-w-0">
                    <div className={`font-black text-sm truncate ${company.isPlayer ? 'text-green-400' : 'text-white'}`}>
                      {company.name}
                    </div>
                    {company.isPlayer && (
                      <div className="text-[9px] text-green-500/70 font-bold">YOUR COMPANY</div>
                    )}
                  </div>
                </div>

                {/* 時価総額 */}
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-500 font-bold">時価総額</div>
                  <div className={`text-sm font-black ${company.isPlayer ? 'text-green-400' : 'text-white'}`}>
                    ${(company.marketCap / 1000).toFixed(0)}M
                  </div>
                </div>

                {/* 推定売上 */}
                <div className="text-right shrink-0 hidden md:block">
                  <div className="text-[10px] text-slate-500 font-bold">推定年収</div>
                  <div className="text-sm font-bold text-slate-300">
                    ${(company.revenue / 1000).toFixed(0)}M
                  </div>
                </div>

                {/* バー */}
                <div className="w-24 shrink-0 hidden lg:block">
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${company.isPlayer ? 'bg-green-500' : company.color}`}
                      style={{ width: `${Math.min(100, (company.marketCap / (ranked[0]?.marketCap || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 消滅した企業 */}
      {(() => {
        const gone = Object.entries(AI_COMPANIES)
          .filter(([, ai]) => ai.disappearsYear && currentYear > ai.disappearsYear);
        if (gone.length === 0) return null;
        return (
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
            <h3 className="font-black text-slate-500 text-sm mb-3">📜 かつての巨人たち（市場から撤退）</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {gone.map(([id, ai]) => (
                <div key={id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${ai.color} opacity-40`} />
                    <span className="text-xs text-slate-600 font-bold line-through">{ai.name}</span>
                  </div>
                  <div className="text-[9px] text-slate-700 mt-1">{ai.appearsYear}年 - {ai.disappearsYear}年</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
