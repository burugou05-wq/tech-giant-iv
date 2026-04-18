import { CheckCircle, Clock, ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '../../context/GameContext.jsx';
import { CORPORATE_FOCUSES } from '../../constants/index.js';

export default function CorporateFocus() {
  const {
    completedFocuses, activeFocus, selectedFocusDetails, setSelectedFocusDetails,
    unlockedTrees, currentYear, startCorporateFocus,
  } = useGame();
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 overflow-auto relative"
      style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)' }}>
      <div className="absolute right-4 top-4 z-30 flex gap-2">
        <button
          type="button"
          onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800/80 text-slate-200 hover:border-slate-400"
          title="縮小"
        ><ZoomOut size={16} /></button>
        <button
          type="button"
          onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800/80 text-slate-200 hover:border-slate-400"
          title="拡大"
        ><ZoomIn size={16} /></button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800/80 text-slate-200 hover:border-slate-400"
          title="リセット"
        ><RefreshCcw size={16} /></button>
        <div className="flex items-center rounded-full border border-slate-600 bg-slate-800/80 px-3 text-[11px] text-slate-300">
          {Math.round(zoom * 100)}%
        </div>
      </div>
      <div className="relative min-w-[2200px] min-h-[1200px]" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        {/* 接続線 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {CORPORATE_FOCUSES.filter(f => unlockedTrees.includes(f.tree)).map(focus =>
            focus.req.map(reqId => {
              const parent = CORPORATE_FOCUSES.find(p => p.id === reqId);
              if (!parent) return null;
              if (focus.id === 'fc_global_entry' && (parent.id === 'fc_exp_first' || parent.id === 'fc_tech_first')) {
                return null;
              }
              return (
                <line
                  key={`${parent.id}-${focus.id}`}
                  x1={parent.x} y1={parent.y + 40}
                  x2={focus.x}  y2={focus.y - 40}
                  stroke="#334155" strokeWidth="2"
                />
              );
            })
          )}
        </svg>

        {/* ノード */}
        {CORPORATE_FOCUSES.filter(f => unlockedTrees.includes(f.tree)).map(focus => {
          const isCompleted = completedFocuses.includes(focus.id);
          const isActive    = activeFocus?.id === focus.id;
          const reqMet      = !focus.req || focus.req.length === 0 || (
            focus.reqType === 'any'
              ? focus.req.some(r => completedFocuses.includes(r))
              : focus.req.every(r => completedFocuses.includes(r))
          );
          const exclBlocked = focus.excl?.some(e => completedFocuses.includes(e));
          const eraOk       = currentYear >= focus.era;

          return (
            <button
              key={focus.id}
              onClick={() => setSelectedFocusDetails(focus)}
              style={{ position: 'absolute', left: focus.x - 100, top: focus.y - 50, width: 200, height: 100 }}
              className={`rounded-xl border-2 p-2 flex flex-col items-center justify-center text-center transition-all duration-300 z-10
                ${isCompleted  ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : isActive     ? 'border-yellow-400 bg-yellow-900/40 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)] animate-pulse'
                : exclBlocked  ? 'border-slate-800 bg-slate-900/80 text-slate-600 opacity-50'
                : !reqMet || !eraOk ? 'border-slate-600 bg-slate-800 text-slate-300'
                : 'border-cyan-400 bg-cyan-900/30 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] hover:scale-105 cursor-pointer'}`}
            >
              <div className="font-black text-xs leading-tight">{focus.name}</div>
              <div className="text-[9px] opacity-60 mt-1 flex items-center gap-1">
                {isCompleted ? <><CheckCircle size={10}/> 完了</> : isActive ? <><Clock size={10}/> 策定中...</> : `${focus.era}年〜 / ${focus.lpCost}T`}
              </div>
            </button>
          );
        })}
      </div>

      {/* 詳細パネル */}
      {selectedFocusDetails && (() => {
        const focus     = selectedFocusDetails;
        const completed = completedFocuses.includes(focus.id);
        const active    = activeFocus?.id === focus.id;
        const reqMet    = !focus.req || focus.req.length === 0 || (
          focus.reqType === 'any'
            ? focus.req.some(r => completedFocuses.includes(r))
            : focus.req.every(r => completedFocuses.includes(r))
        );
        const exclBlocked = focus.excl?.some(e => completedFocuses.includes(e));
        const canStart  = !completed && !active && !activeFocus && reqMet && !exclBlocked && currentYear >= focus.era;
        return (
          <div className="fixed bottom-10 right-10 w-72 bg-slate-800 border-2 border-indigo-500 p-6 rounded-2xl shadow-2xl z-50">
            <h4 className="font-black text-white text-lg">{focus.name}</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{focus.desc}</p>
            {activeFocus && !active && (
              <p className="text-[10px] text-yellow-500 mt-2">※ 別の方針を策定中のため開始できません</p>
            )}
            {exclBlocked && (
              <p className="text-[10px] text-red-400 mt-2">※ 排他方針を選択済みです</p>
            )}
            <div className="mt-4 flex flex-col gap-2">
              {canStart && (
                <button
                  onClick={() => startCorporateFocus(focus.id)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-black text-white"
                >
                  策定開始
                </button>
              )}
              <button
                onClick={() => setSelectedFocusDetails(null)}
                className="text-[10px] text-slate-500 font-bold"
              >
                閉じる
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
