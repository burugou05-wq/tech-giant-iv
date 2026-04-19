import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

export const FocusNode = ({ 
  focus, 
  isCompleted, 
  isActive, 
  reqMet, 
  exclBlocked, 
  eraOk, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      style={{ position: 'absolute', left: focus.x - 100, top: focus.y - 50, width: 200, height: 100 }}
      className={`rounded-xl border-2 p-3 flex flex-col items-center justify-center text-center transition-all duration-300 z-10
        ${isCompleted  ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        : isActive     ? 'border-yellow-400 bg-yellow-900/40 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)] animate-pulse'
        : exclBlocked  ? 'border-slate-800 bg-slate-900/80 text-slate-600 opacity-50'
        : !reqMet || !eraOk ? 'border-slate-600 bg-slate-800 text-slate-300'
        : 'border-cyan-400 bg-cyan-900/30 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] hover:scale-105 cursor-pointer'}`}
    >
      <div className="font-black text-xs leading-tight tracking-tight px-1">
        {focus.name}
      </div>
      <div className="text-[9px] opacity-60 mt-1.5 flex items-center gap-1 font-bold uppercase tracking-widest">
        {isCompleted ? (
          <><CheckCircle size={10} className="text-emerald-400" /> 完了</>
        ) : isActive ? (
          <><Clock size={10} className="text-yellow-400 animate-spin-slow" /> 残り {(focus.lpCost - (isActive.progress || 0)) * 7}日</>
        ) : (
          <span className="opacity-70">{focus.era}年〜 / {focus.lpCost * 7}日間</span>
        )}
      </div>
    </button>
  );
};
