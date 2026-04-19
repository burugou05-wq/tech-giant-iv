import React from 'react';
import { X, PlayCircle } from 'lucide-react';

export const FocusDetailPanel = ({ 
  focus, 
  completedFocuses, 
  activeFocus, 
  currentYear, 
  onStart, 
  onClose 
}) => {
  if (!focus) return null;

  const isCompleted = completedFocuses.includes(focus.id);
  const isActive    = activeFocus?.id === focus.id;
  const reqMet      = !focus.req || focus.req.length === 0 || (
    focus.reqType === 'any'
      ? focus.req.some(r => completedFocuses.includes(r))
      : focus.req.every(r => completedFocuses.includes(r))
  );
  const exclBlocked = focus.excl?.some(e => completedFocuses.includes(e));
  const eraOk       = currentYear >= focus.era;
  const canStart    = !isCompleted && !isActive && !activeFocus && reqMet && !exclBlocked && eraOk;

  return (
    <div className="fixed bottom-10 right-10 w-80 bg-slate-900/95 backdrop-blur-xl border-2 border-indigo-500/50 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-slide-in-up">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-black text-white text-lg tracking-tight leading-none">{focus.name}</h4>
        <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <p className="text-xs text-slate-300 leading-relaxed italic">{focus.desc}</p>
        </div>

        <div className="space-y-1.5">
          {!eraOk && (
            <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1.5">
              • {focus.era}年以降に解放可能
            </div>
          )}
          {!reqMet && (
            <div className="text-[10px] text-rose-500 font-bold flex items-center gap-1.5">
              • 前提条件となる方針が未完了です
            </div>
          )}
          {activeFocus && !isActive && (
            <div className="text-[10px] text-yellow-500 font-bold flex items-center gap-1.5">
              • 別の方針（{activeFocus.name}）を策定中です
            </div>
          )}
          {exclBlocked && (
            <div className="text-[10px] text-red-500 font-bold flex items-center gap-1.5">
              • 既に反対の方針を選択済みです
            </div>
          )}
        </div>

        {isActive ? (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-yellow-400 uppercase tracking-widest">
              <span>策定中...</span>
              <span>残り {Math.ceil((activeFocus.remainingTicks || 0) * 0.5)}ヶ月</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500 ease-out"
                style={{ width: `${activeFocus.progress || 0}%` }}
              />
            </div>
          </div>
        ) : canStart ? (
          <button
            onClick={() => onStart(focus.id)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PlayCircle size={14} />
            {focus.lpCost * 0.5}ヶ月間で策定
          </button>
        ) : (
          !isCompleted && (
            <div className="w-full py-3 bg-slate-800 rounded-xl text-[10px] font-black text-slate-500 text-center border border-slate-700">
              策定条件を満たしていません
            </div>
          )
        )}
      </div>
    </div>
  );
};
