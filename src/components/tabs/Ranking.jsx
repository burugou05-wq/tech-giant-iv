import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { AI_COMPANIES } from '../../constants/companies/index.js';
import CompanyDetailPanel from '../CompanyDetailPanel.jsx';

// 分割したコンポーネントとロジックのインポート
import { RankingHeader } from './Ranking/RankingHeader.jsx';
import { RankingRow } from './Ranking/RankingRow.jsx';
import { DefunctCompanies } from './Ranking/DefunctCompanies.jsx';
import { getRankedCompanies } from '../../logic/engine/rankingLogic.js';

export default function Ranking() {
  const state = useGame();
  const { currentYear } = state;
  const [selectedCompany, setSelectedCompany] = useState(null);

  // ランキングデータの構築（メモ化してパフォーマンス最適化）
  const ranked = useMemo(() => getRankedCompanies(state), [
    state.currentYear, 
    state.stockPrice, 
    state.aiProducts, 
    state.markets, 
    state.money
  ]);

  const playerRank = ranked.findIndex(c => c.isPlayer) + 1;
  const defunct = Object.entries(AI_COMPANIES)
    .filter(([, ai]) => ai.disappearsYear && currentYear > ai.disappearsYear);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ヘッダーセクション */}
      <RankingHeader 
        currentYear={currentYear}
        playerRank={playerRank}
        totalCompanies={ranked.length}
      />

      {/* ランキングリストセクション */}
      <div className="space-y-3">
        {ranked.map((company, index) => (
          <RankingRow 
            key={company.id}
            company={company}
            rank={index + 1}
            maxMarketCap={ranked[0]?.marketCap || 1}
            onClick={() => !company.isPlayer && setSelectedCompany(company.id)}
          />
        ))}
      </div>

      {/* 歴史セクション（撤退済み企業） */}
      <DefunctCompanies companies={defunct} />

      {/* 競合他社詳細パネル */}
      <CompanyDetailPanel 
        companyId={selectedCompany} 
        onClose={() => setSelectedCompany(null)} 
      />
    </div>
  );
}
