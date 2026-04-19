import React, { useState } from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { CORPORATE_FOCUSES } from '../../constants/index.js';

// 分割したコンポーネントのインポート
import { FocusNode } from './CorporateFocus/FocusNode.jsx';
import { FocusDetailPanel } from './CorporateFocus/FocusDetailPanel.jsx';
import { FocusZoomControls } from './CorporateFocus/FocusZoomControls.jsx';
import { FocusConnections } from './CorporateFocus/FocusConnections.jsx';

export default function CorporateFocus() {
  const {
    completedFocuses = [], 
    activeFocus, 
    selectedFocusDetails, 
    setSelectedFocusDetails,
    unlockedTrees = ['main'], 
    currentYear, 
    startCorporateFocus,
  } = useGame();
  
  const [zoom, setZoom] = useState(1);

  // 安全なフィルタリング
  const visibleFocuses = CORPORATE_FOCUSES.filter(f => {
    const trees = unlockedTrees || ['main'];
    return trees.includes(f.tree);
  });

  return (
    <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 overflow-auto relative shadow-2xl"
      style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)' }}>
      
      {/* ズームコントロール */}
      <FocusZoomControls zoom={zoom} setZoom={setZoom} />

      {/* ツリーキャンバス */}
      <div className="relative min-w-[2200px] min-h-[1200px] p-24" 
           style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.2s ease-out' }}>
        
        {/* 接続線 (SVG) */}
        <FocusConnections 
          unlockedTrees={unlockedTrees || ['main']} 
          completedFocuses={completedFocuses || []} 
        />

        {/* 方針ノード群 */}
        {visibleFocuses.map(focus => {
          const completed = completedFocuses || [];
          const isCompleted = completed.includes(focus.id);
          const activeMatch = activeFocus?.id === focus.id ? activeFocus : null;
          const reqMet      = !focus.req || focus.req.length === 0 || (
            focus.reqType === 'any'
              ? focus.req.some(r => completed.includes(r))
              : focus.req.every(r => completed.includes(r))
          );
          const exclBlocked = focus.excl?.some(e => completedFocuses.includes(e));
          const eraOk       = currentYear >= focus.era;

          return (
            <FocusNode
              key={focus.id}
              focus={focus}
              isCompleted={isCompleted}
              isActive={activeMatch}
              reqMet={reqMet}
              exclBlocked={exclBlocked}
              eraOk={eraOk}
              onClick={() => setSelectedFocusDetails(focus)}
            />
          );
        })}
      </div>

      {/* 詳細パネル（モーダル風） */}
      <FocusDetailPanel 
        focus={selectedFocusDetails}
        completedFocuses={completedFocuses}
        activeFocus={activeFocus}
        currentYear={currentYear}
        onStart={startCorporateFocus}
        onClose={() => setSelectedFocusDetails(null)}
      />

      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-up {
          animation: slideInUp 0.3s ease-out forwards;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
